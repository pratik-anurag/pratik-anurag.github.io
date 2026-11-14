package analysis

import (
	"fmt"
	"strings"
)

type Finding struct {
	Code     string `json:"code"`
	Severity string `json:"severity"`
	Path     string `json:"path"`
	Message  string `json:"message"`
	Fix      string `json:"fix"`
}

func findings(body map[string]interface{}, nodes []Clause) []Finding {
	result := []Finding{}
	add := func(code, severity, path, message, fix string) {
		result = append(result, Finding{code, severity, path, message, fix})
	}
	// Omitted size defaults to 10 hits in Elasticsearch, not unlimited hits.
	if _, ok := body["size"]; !ok {
		add("missing-size", "info", "$.size", "No explicit hit limit; Elasticsearch normally defaults to 10 hits.", "Set size explicitly, or use size: 0 when only aggregations are needed.")
	}
	from, _ := body["from"].(float64)
	size, hasSize := body["size"].(float64)
	if !hasSize {
		size = 10
	}
	if from+size > 10000 {
		add("deep-paging", "risk", "$.from", "from + size exceeds the usual 10,000-result window.", "Use search_after with a stable sort and point-in-time search for deep pagination.")
	}
	var walk func([]Clause, int)
	walk = func(cs []Clause, depth int) {
		for _, c := range cs {
			switch c.Type {
			case "wildcard":
				for _, field := range keys(object(c.body)) {
					v := object(c.body)[field]
					pattern, ok := v.(string)
					if !ok {
						pattern, _ = object(v)["value"].(string)
					}
					if strings.HasPrefix(pattern, "*") || strings.HasPrefix(pattern, "?") {
						add("leading-wildcard", "risk", c.Path, "A leading wildcard can expand across many indexed terms.", "Use a prefix query or a purpose-built wildcard/ngram field after checking the mapping.")
					}
				}
			case "regexp":
				add("regexp", "warn", c.Path, "Regular-expression expansion can be expensive.", "Constrain the pattern and candidate documents; use an exact term or prefix where possible.")
			case "script", "script_score":
				add("script", "risk", c.Path, "Scripts can execute for many candidate documents.", "Precompute the value at ingest where possible and narrow candidates with indexed filters.")
			case "function_score":
				if fs, ok := object(c.body)["functions"].([]interface{}); ok {
					for _, f := range fs {
						if _, ok := object(f)["script_score"]; ok {
							add("script", "risk", c.Path, "A scoring function runs a script on candidate documents.", "Narrow candidates and consider a precomputed numeric field.")
							break
						}
					}
				}
			case "terms":
				for _, field := range keys(object(c.body)) {
					if values, ok := object(c.body)[field].([]interface{}); ok && len(values) > 1024 {
						add("huge-terms", "warn", c.Path, fmt.Sprintf("terms contains %d values (playground threshold: 1,024).", len(values)), "Reduce or batch the list, or reconsider the indexing and lookup model.")
					}
				}
			case "match_all":
				add("match-all", "info", c.Path, "This clause matches every document.", "Add selective filters if a full-index match is not intentional.")
			case "term":
				for _, field := range keys(object(c.body)) {
					if field == "title" || field == "name" || field == "description" || field == "body" || field == "content" {
						add("possible-text-term", "info", c.Path, "This field name may represent analyzed text; its mapping is unknown.", "Check the mapping: use match for analyzed text or a keyword subfield for exact values.")
					}
				}
			}
			if c.Type == "term" || c.Type == "terms" || c.Type == "range" || c.Type == "exists" {
				if c.Role == "scoring" && strings.Contains(c.Path, ".must[") {
					add("filter-in-must", "warn", c.Path, "An exact-value or range clause in must contributes to scoring.", "If its score is not needed, move this clause to bool.filter.")
				}
				if c.Role == "scoring" && strings.HasSuffix(c.Path, ".must."+c.Type) {
					add("filter-in-must", "warn", c.Path, "An exact-value or range clause in must contributes to scoring.", "If its score is not needed, move this clause to bool.filter.")
				}
			}
			if c.Type == "bool" && depth >= 5 {
				add("deep-nesting", "warn", c.Path, "This query has at least five layers of clause nesting.", "Flatten redundant bool wrappers where doing so preserves minimum_should_match and scoring.")
			}
			next := depth + 1
			if c.Type == "must" || c.Type == "filter" || c.Type == "should" || c.Type == "must_not" {
				next = depth
			}
			walk(c.Children, next)
		}
	}
	walk(nodes, 0)
	return result
}
