package analysis

import (
	"encoding/json"
	"strings"
	"testing"
)

func codes(t *testing.T, q string) map[string]bool {
	t.Helper()
	r, err := Analyze(q, "")
	if err != nil {
		t.Fatal(err)
	}
	out := map[string]bool{}
	for _, f := range r.Findings {
		out[f.Code] = true
	}
	return out
}
func TestRules(t *testing.T) {
	tests := []struct{ name, query, code string }{
		{"wildcard", `{"query":{"wildcard":{"sku":{"value":"*shoe"}}}}`, "leading-wildcard"},
		{"question", `{"wildcard":{"sku":"?shoe"}}`, "leading-wildcard"},
		{"regexp", `{"regexp":{"sku":".*"}}`, "regexp"},
		{"script", `{"script":{"script":"true"}}`, "script"},
		{"script-score", `{"script_score":{"query":{"match_all":{}},"script":{"source":"1"}}}`, "script"},
		{"function-script", `{"function_score":{"query":{"match_all":{}},"functions":[{"script_score":{"script":"1"}}]}}`, "script"},
		{"must", `{"bool":{"must":[{"term":{"in_stock":true}}]}}`, "filter-in-must"},
		{"must-object", `{"bool":{"must":{"range":{"price":{"lt":50}}}}}`, "filter-in-must"},
		{"paging", `{"from":10000,"size":20,"query":{"match_all":{}}}`, "deep-paging"},
		{"all", `{"match_all":{}}`, "match-all"},
		{"size", `{"term":{"sku":"x"}}`, "missing-size"},
		{"text", `{"term":{"title":"Running Shoes"}}`, "possible-text-term"},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			if !codes(t, tc.query)[tc.code] {
				t.Fatalf("missing %s", tc.code)
			}
		})
	}
	if codes(t, `{"size":10,"query":{"bool":{"filter":[{"term":{"sku.keyword":"x"}}],"must":[{"match":{"name":"shoe"}}]}}}`)["filter-in-must"] {
		t.Fatal("filter context flagged")
	}
	if codes(t, `{"query":{"wildcard":{"sku":"shoe*"}}}`)["leading-wildcard"] {
		t.Fatal("prefix wildcard flagged")
	}
	if codes(t, `{"term":{"title.keyword":"Running Shoes"}}`)["possible-text-term"] {
		t.Fatal("keyword flagged")
	}
}
func TestHugeTermsAndDepth(t *testing.T) {
	list := make([]int, 1025)
	raw, _ := json.Marshal(map[string]interface{}{"terms": map[string]interface{}{"sku": list}})
	if !codes(t, string(raw))["huge-terms"] {
		t.Fatal("terms not flagged")
	}
	q := `{"term":{"sku":"x"}}`
	for i := 0; i < 7; i++ {
		q = `{"bool":{"filter":[` + q + `]}}`
	}
	if !codes(t, q)["deep-nesting"] {
		t.Fatal("depth not flagged")
	}
}
func TestMalformedAndLimits(t *testing.T) {
	for _, q := range []string{"", "null", "[]", "{}", `{"query":null}`, `{"query":{}}`, `{"x":`, strings.Repeat("x", MaxInput+1)} {
		if _, err := Analyze(q, ""); err == nil {
			t.Fatalf("accepted invalid query %.50s", q)
		}
	}
	q := `{"match_all":{}}`
	for i := 0; i < 70; i++ {
		q = `{"bool":{"filter":[` + q + `]}}`
	}
	if _, err := Analyze(q, ""); err == nil {
		t.Fatal("unbounded depth")
	}
}
func TestUnknownAndRoles(t *testing.T) {
	r, err := Analyze(`{"query":{"bool":{"filter":[{"nested":{"path":"items","query":{"custom_clause":{"x":1}}}}]}}}`, "")
	if err != nil {
		t.Fatal(err)
	}
	node := r.Clauses[0].Children[0].Children[0].Children[0]
	if node.Role != "filtering" || !strings.Contains(node.Description, "Unrecognized") {
		t.Fatalf("%+v", node)
	}
	if node.Path != "$.query.bool.filter[0].nested.query.custom_clause" {
		t.Fatal(node.Path)
	}
}
func TestDeterministicReport(t *testing.T) {
	q := `{"size":10,"query":{"bool":{"must":{"match":{"name":"shoes"}},"filter":{"term":{"stock":true}}}}}`
	a, _ := Analyze(q, "")
	for i := 0; i < 10; i++ {
		b, _ := Analyze(q, "")
		if a.Report != b.Report {
			t.Fatal("unstable report")
		}
	}
}
