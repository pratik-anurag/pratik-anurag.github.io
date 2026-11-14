package nl

import (
	"fmt"
	"strings"

	"esplain/explain"
)

// Summarize generates a natural language explanation of the query AST
// and explain results. Profiling summary can be added later.
func Summarize(tree interface{}, explainRes interface{}, prof interface{}) string {
	parts := []string{}

	// Summarize AST clauses
	if qt, ok := tree.(*explain.QueryTree); ok && qt != nil {
		if len(qt.Children) > 0 {
			var names []string
			for _, c := range qt.Children {
				names = append(names, c.Name)
			}
			parts = append(parts, fmt.Sprintf("Query contains %d top-level clauses: %s.", len(names), strings.Join(names, ", ")))
		}
	}

	// Summarize explain result
	if er, ok := explainRes.(*explain.ExplainResult); ok && er != nil {
		status := "does not match"
		if er.Matched {
			status = "matches"
		}
		parts = append(parts, fmt.Sprintf("Document '%s' %s this query. Explanation: %s", er.ID, status, er.Explanation))
	}

	// Future: handle profiling data from 'prof'

	return strings.Join(parts, " ")
}
