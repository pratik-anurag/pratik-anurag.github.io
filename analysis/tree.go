package analysis

import (
	"encoding/json"
	"fmt"
	"sort"
	"strings"
)

type Clause struct {
	body        interface{}
	Type        string   `json:"type"`
	Path        string   `json:"path"`
	Role        string   `json:"role"`
	Description string   `json:"description"`
	Children    []Clause `json:"children"`
}

func keys(m map[string]interface{}) []string {
	out := make([]string, 0, len(m))
	for k := range m {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}
func object(v interface{}) map[string]interface{} { m, _ := v.(map[string]interface{}); return m }
func printable(v interface{}) string {
	b, _ := json.Marshal(v)
	s := string(b)
	if len(s) > 160 {
		return s[:160] + "…"
	}
	return s
}
func fieldValue(v interface{}) string {
	m := object(v)
	for _, k := range keys(m) {
		if k != "boost" && k != "_name" {
			return fmt.Sprintf("%q = %s", k, printable(m[k]))
		}
	}
	return printable(v)
}
func clauses(v interface{}, path, role string) []Clause {
	result := []Clause{}
	if list, ok := v.([]interface{}); ok {
		for i, item := range list {
			result = append(result, clauses(item, fmt.Sprintf("%s[%d]", path, i), role)...)
		}
		return result
	}
	for _, kind := range keys(object(v)) {
		body := object(v)[kind]
		p := path + "." + kind
		c := Clause{Type: kind, Path: p, Role: role, Children: []Clause{}, body: body}
		switch kind {
		case "bool":
			c.Description = "Combine required, optional, and excluded clauses."
			for _, group := range []string{"must", "should", "filter", "must_not"} {
				if child, ok := object(body)[group]; ok {
					r := role
					desc := "Required match; contributes to score."
					switch group {
					case "filter":
						r = "filtering"
						desc = "Required match without score calculation."
					case "must_not":
						r = "filtering"
						desc = "Exclude matching documents without calculating a score."
					case "should":
						desc = "Optional scoring match; may be required by minimum_should_match."
					}
					if role == "filtering" {
						r = "filtering"
						if group == "must" || group == "should" {
							desc = "Match within filter context; scores are ignored."
						}
					}
					c.Children = append(c.Children, Clause{Type: group, Path: p + "." + group, Role: r, Description: desc, Children: clauses(child, p+"."+group, r)})
				}
			}
			if n, ok := object(body)["minimum_should_match"]; ok {
				c.Description += " minimum_should_match = " + printable(n) + "."
			}
		case "match":
			c.Description = "Analyze the search text and match terms: " + fieldValue(body) + "."
		case "match_phrase":
			c.Description = "Match analyzed terms in phrase order: " + fieldValue(body) + "."
		case "multi_match":
			c.Description = "Analyze text across several fields: " + printable(body) + "."
		case "term":
			c.Description = "Match an exact indexed term: " + fieldValue(body) + "."
		case "terms":
			c.Description = "Match any exact indexed term: " + fieldValue(body) + "."
		case "range":
			c.Description = "Match values within bounds: " + fieldValue(body) + "."
		case "wildcard":
			c.Description = "Match a wildcard pattern: " + fieldValue(body) + "."
		case "regexp":
			c.Description = "Match a regular expression: " + fieldValue(body) + "."
		case "script":
			c.Description = "Evaluate a script for each candidate document: " + printable(body) + "."
		case "exists":
			c.Description = "Require an indexed value for " + printable(object(body)["field"]) + "."
		case "match_all":
			c.Description = "Match every document."
		case "match_none":
			c.Description = "Match no documents."
		case "prefix":
			c.Description = "Match terms beginning with a prefix: " + fieldValue(body) + "."
		case "fuzzy":
			c.Description = "Match similar terms within an edit distance: " + fieldValue(body) + "."
		case "ids":
			c.Description = "Match documents by identifier: " + printable(body) + "."
		case "query_string", "simple_query_string":
			c.Description = "Parse a query-string expression: " + printable(body) + "."
		case "nested":
			c.Description = "Search nested objects at path " + printable(object(body)["path"]) + "."
			c.Children = clauses(object(body)["query"], p+".query", role)
		case "constant_score":
			c.Description = "Assign the same boost to every matching document."
			c.Children = clauses(object(body)["filter"], p+".filter", "filtering")
		case "dis_max":
			c.Description = "Use the best matching child score, with an optional tie breaker."
			c.Children = clauses(object(body)["queries"], p+".queries", role)
		case "function_score", "script_score", "boosting":
			c.Description = "Modify scores for matching documents."
			for _, key := range []string{"query", "positive", "negative", "filter"} {
				if child, ok := object(body)[key]; ok {
					r := role
					if key == "filter" {
						r = "filtering"
					}
					c.Children = append(c.Children, clauses(child, p+"."+key, r)...)
				}
			}
		default:
			c.Description = "Unrecognized clause. Its JSON is retained in the raw query tree."
		}
		result = append(result, c)
	}
	return result
}
func checkComplexity(v interface{}, depth int, count *int) error {
	*count++
	if depth > 64 {
		return fmt.Errorf("JSON exceeds 64 nesting levels; simplify the input")
	}
	if *count > 25000 {
		return fmt.Errorf("JSON contains too many values (limit 25,000); reduce the input")
	}
	switch n := v.(type) {
	case map[string]interface{}:
		for _, v := range n {
			if err := checkComplexity(v, depth+1, count); err != nil {
				return err
			}
		}
	case []interface{}:
		for _, v := range n {
			if err := checkComplexity(v, depth+1, count); err != nil {
				return err
			}
		}
	}
	return nil
}
func decodeInput(raw, label string) (map[string]interface{}, error) {
	var value map[string]interface{}
	if err := json.Unmarshal([]byte(raw), &value); err != nil {
		if syntax, ok := err.(*json.SyntaxError); ok {
			pos := int(syntax.Offset) - 1
			if pos < 0 {
				pos = 0
			}
			return nil, fmt.Errorf("%s JSON, line %d: %s", label, strings.Count(raw[:pos], "\n")+1, err)
		}
		return nil, fmt.Errorf("%s must be a JSON object: %w", label, err)
	}
	if value == nil {
		return nil, fmt.Errorf("%s must be a JSON object", label)
	}
	count := 0
	if err := checkComplexity(value, 0, &count); err != nil {
		return nil, err
	}
	return value, nil
}
