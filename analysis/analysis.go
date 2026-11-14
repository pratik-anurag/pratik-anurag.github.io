// Package analysis combines EsPlain's pure parsers without an Elasticsearch client.
package analysis

import (
	"esplain/explain"
	"esplain/nl"
	"fmt"
	"strings"
)

const MaxInput = 1024 * 1024

type Result struct {
	Clauses []Clause           `json:"clauses"`
	Tree    *explain.QueryTree `json:"tree"`
	Summary string             `json:"summary"`
	Report  string             `json:"report"`
}

func Analyze(query, response string) (*Result, error) {
	if len(query) > MaxInput || len(response) > MaxInput {
		return nil, fmt.Errorf("each input must be at most 1 MiB")
	}
	if strings.TrimSpace(query) == "" {
		return nil, fmt.Errorf("paste a query to begin")
	}
	obj, err := decodeInput(query, "Query")
	if err != nil {
		return nil, err
	}
	if len(obj) == 0 {
		return nil, fmt.Errorf("query must be a non-empty JSON object")
	}
	tree := explain.Parse(query)
	q := interface{}(obj)
	path := "$"
	if wrapped, ok := obj["query"]; ok {
		q = wrapped
		path = "$.query"
	}
	if len(object(q)) == 0 {
		return nil, fmt.Errorf("query clause must be a non-empty object")
	}
	nodes := clauses(q, path, "scoring")
	summary := nl.Summarize(tree, nil, nil)
	var report strings.Builder
	explain.WriteTree(&report, tree, 0)
	fmt.Fprintf(&report, "\nNatural Language Breakdown:\n%s\n", summary)
	return &Result{Tree: tree, Clauses: nodes, Summary: summary, Report: report.String()}, nil
}
