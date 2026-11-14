package analysis

import (
	"encoding/json"
	"esplain/explain"
	"esplain/profile"
	"fmt"
	"strings"
)

type Score struct {
	Description string  `json:"description"`
	Value       float64 `json:"value"`
	Children    []Score `json:"children"`
}
type Timing struct {
	Name     string   `json:"name"`
	Type     string   `json:"type"`
	Nanos    int64    `json:"nanos"`
	Shard    string   `json:"shard"`
	Search   int      `json:"search"`
	Children []Timing `json:"children"`
}
type Validation struct {
	Valid        bool     `json:"valid"`
	Explanations []string `json:"explanations"`
}
type Runtime struct {
	HasProfile bool                   `json:"hasProfile"`
	Score      *Score                 `json:"score,omitempty"`
	Explain    *explain.ExplainResult `json:"explain,omitempty"`
	Timings    []Timing               `json:"timings"`
	TotalNanos int64                  `json:"totalNanos"`
	MaxNanos   int64                  `json:"maxNanos"`
	Slowest    string                 `json:"slowest"`
	Validation *Validation            `json:"validation,omitempty"`
}

func scoreNode(description string, value float64, children []explain.ExplainDetail) *Score {
	node := &Score{Description: description, Value: value, Children: []Score{}}
	for _, c := range children {
		node.Children = append(node.Children, *scoreNode(c.Description, c.Value, c.Children))
	}
	return node
}
func bytesOf(v interface{}) []byte { b, _ := json.Marshal(v); return b }
func parseRuntime(raw string) (*Runtime, *profile.ProfileResult, error) {
	data, err := decodeInput(raw, "Response")
	if err != nil {
		return nil, nil, err
	}
	result := &Runtime{Timings: []Timing{}}
	recognized := false
	// Accept direct _explain, a combined envelope, or a hit's _explanation.
	exp := data
	if v, ok := data["explain"]; ok {
		exp = object(v)
	} else if v, ok := data["_explain"]; ok {
		exp = object(v)
	}
	if _, ok := exp["explanation"]; !ok {
		if _, ok := exp["description"]; ok {
			exp = map[string]interface{}{"explanation": exp}
		}
	}
	if _, ok := exp["explanation"]; ok {
		parsed, value, err := explain.ParseDetails(bytesOf(exp))
		if err != nil {
			return nil, nil, fmt.Errorf("explain response: %w", err)
		}
		result.Explain = parsed
		result.Score = scoreNode(parsed.Explanation, value, parsed.Details)
		recognized = true
	} else if hits := object(data["hits"]); hits != nil {
		if list, ok := hits["hits"].([]interface{}); ok {
			for _, item := range list {
				hit := object(item)
				if e, ok := hit["_explanation"]; ok {
					envelope := map[string]interface{}{"_index": hit["_index"], "_id": hit["_id"], "matched": true, "explanation": e}
					parsed, value, err := explain.ParseDetails(bytesOf(envelope))
					if err != nil {
						return nil, nil, err
					}
					result.Explain = parsed
					result.Score = scoreNode(parsed.Explanation, value, parsed.Details)
					recognized = true
					break
				}
			}
		}
	}
	validation := data
	if v, ok := data["validate"]; ok {
		validation = object(v)
	} else if v, ok := data["_validate"]; ok {
		validation = object(v)
	}
	if v, ok := validation["valid"]; ok {
		valid, ok := v.(bool)
		if !ok {
			return nil, nil, fmt.Errorf("validate.valid must be a boolean")
		}
		result.Validation = &Validation{Valid: valid, Explanations: []string{}}
		recognized = true
		if list, ok := validation["explanations"].([]interface{}); ok {
			for _, item := range list {
				m := object(item)
				for _, key := range []string{"explanation", "error"} {
					if s, ok := m[key].(string); ok {
						result.Validation.Explanations = append(result.Validation.Explanations, s)
					}
				}
			}
		}
	}
	// Normalize full _search responses and {profile:{profile:{shards:…}}}.
	p := object(data["profile"])
	if p == nil {
		p = object(data["_profile"])
	}
	if nested := object(p["profile"]); nested != nil {
		p = nested
	}
	if p == nil {
		if _, ok := data["shards"]; ok {
			p = data
		}
	}
	var original *profile.ProfileResult
	if p != nil {
		result.HasProfile = true
		if _, ok := p["shards"].([]interface{}); !ok {
			return nil, nil, fmt.Errorf("profile.shards must be an array")
		}
		normalized := map[string]interface{}{"profile": p}
		original, err = profile.Parse(bytesOf(normalized))
		if err != nil {
			return nil, nil, err
		}
		var typed struct {
			Shards []struct {
				ID       string `json:"id"`
				Searches []struct {
					Query []json.RawMessage `json:"query"`
				} `json:"searches"`
			} `json:"shards"`
		}
		if err := json.Unmarshal(bytesOf(p), &typed); err != nil {
			return nil, nil, fmt.Errorf("profile response: %w", err)
		}
		var parseTiming func(json.RawMessage, string, int) (Timing, error)
		parseTiming = func(raw json.RawMessage, shard string, search int) (Timing, error) {
			var t struct {
				Description string            `json:"description"`
				Type        string            `json:"type"`
				Nanos       *int64            `json:"time_in_nanos"`
				Children    []json.RawMessage `json:"children"`
			}
			if err := json.Unmarshal(raw, &t); err != nil {
				return Timing{}, err
			}
			if t.Nanos == nil || *t.Nanos < 0 || *t.Nanos > 9007199254740991 {
				return Timing{}, fmt.Errorf("each profile node needs non-negative, safely representable time_in_nanos")
			}
			out := Timing{Name: t.Description, Type: t.Type, Nanos: *t.Nanos, Shard: shard, Search: search, Children: []Timing{}}
			for _, c := range t.Children {
				child, err := parseTiming(c, shard, search)
				if err != nil {
					return out, err
				}
				out.Children = append(out.Children, child)
			}
			return out, nil
		}
		for i, shard := range typed.Shards {
			label := shard.ID
			if label == "" {
				label = fmt.Sprintf("shard %d", i)
			}
			for si, search := range shard.Searches {
				for _, raw := range search.Query {
					node, err := parseTiming(raw, label, si)
					if err != nil {
						return nil, nil, fmt.Errorf("profile response: %w", err)
					}
					if result.TotalNanos > 9007199254740991-node.Nanos {
						return nil, nil, fmt.Errorf("profile total is too large")
					}
					result.Timings = append(result.Timings, node)
					result.TotalNanos += node.Nanos
					if node.Nanos > result.MaxNanos {
						result.MaxNanos = node.Nanos
						result.Slowest = node.Name
					}
				}
			}
		}
		recognized = true
	}
	if !recognized {
		return nil, nil, fmt.Errorf("response not recognized; paste an _explain, _validate, or search profile response")
	}
	return result, original, nil
}
func runtimeReport(report *strings.Builder, r *Runtime, original *profile.ProfileResult) {
	if r.Explain != nil {
		explain.WriteExplain(report, r.Explain)
		fmt.Fprintf(report, "Root score: %.6g (%s)\n", r.Score.Value, r.Score.Description)
	}
	if r.Validation != nil {
		fmt.Fprintf(report, "\nValidate: valid=%v\n", r.Validation.Valid)
		for _, line := range r.Validation.Explanations {
			fmt.Fprintln(report, line)
		}
	}
	if original != nil {
		profile.WriteCosts(report, original)
		fmt.Fprintf(report, "Root query time sum: %d ns (not wall-clock latency). Parent and child timings are inclusive.\n", r.TotalNanos)
		var write func([]Timing, int)
		write = func(nodes []Timing, depth int) {
			for _, n := range nodes {
				fmt.Fprintf(report, "%s- %s: %d ns [shard=%s search=%d]\n", strings.Repeat("  ", depth), n.Name, n.Nanos, n.Shard, n.Search)
				write(n.Children, depth+1)
			}
		}
		write(r.Timings, 0)
	}
}
