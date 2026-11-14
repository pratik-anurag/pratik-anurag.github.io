package explain

// QueryTree represents the AST of an Elasticsearch query.
type QueryTree struct {
	Name     string       // node name or key
	Value    string       // scalar value if leaf
	Children []*QueryTree // nested sub-queries or clauses
}

// ExplainResult holds the data returned by the _explain API.
type ExplainResult struct {
	Index       string // index used
	ID          string // document ID
	Matched     bool   // whether the doc matched
	Explanation string // top-level explanation text
	Details     []ExplainDetail
}

// ExplainDetail represents a node in the explanation tree.
type ExplainDetail struct {
	Description string
	Value       float64
	Children    []ExplainDetail
}
