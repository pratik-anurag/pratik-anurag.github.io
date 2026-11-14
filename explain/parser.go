// Adapted from pratik-anurag/esplain at 379b9303ccbb46f1b839d8011923ae043ec0a739.
package explain

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"sort"
	"strings"
)

// Parse preserves the upstream QueryTree representation. Keys are sorted so
// reports remain reproducible rather than depending on Go map iteration order.
func Parse(raw string) *QueryTree {
	var data interface{}
	if err := json.Unmarshal([]byte(raw), &data); err != nil {
		return &QueryTree{Name: "Error", Value: err.Error()}
	}
	return buildTree("root", data)
}

func buildTree(key string, value interface{}) *QueryTree {
	node := &QueryTree{Name: key}
	switch val := value.(type) {
	case map[string]interface{}:
		keys := make([]string, 0, len(val))
		for k := range val {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		for _, k := range keys {
			node.Children = append(node.Children, buildTree(k, val[k]))
		}
	case []interface{}:
		for i, item := range val {
			node.Children = append(node.Children, buildTree(fmt.Sprintf("[%d]", i), item))
		}
	default:
		node.Value = fmt.Sprintf("%v", val)
	}
	return node
}
func WriteTree(w io.Writer, node *QueryTree, level int) {
	fmt.Fprintf(w, "%s- %s", strings.Repeat("  ", level), node.Name)
	if node.Value != "" {
		fmt.Fprintf(w, ": %s", node.Value)
	}
	fmt.Fprintln(w)
	for _, child := range node.Children {
		WriteTree(w, child, level+1)
	}
}
func PrintTree(node *QueryTree) { WriteTree(os.Stdout, node, 0) }

// ParseDetails is the upstream recursive score parser, with checked decoding.
func ParseDetails(raw json.RawMessage) (*ExplainResult, float64, error) {
	var response struct {
		Index       string          `json:"_index"`
		ID          string          `json:"_id"`
		Matched     bool            `json:"matched"`
		Explanation json.RawMessage `json:"explanation"`
	}
	if err := json.Unmarshal(raw, &response); err != nil {
		return nil, 0, err
	}
	if len(response.Explanation) == 0 {
		return nil, 0, fmt.Errorf("expected an explanation object")
	}
	var decode func(json.RawMessage, int) (ExplainDetail, error)
	decode = func(data json.RawMessage, depth int) (ExplainDetail, error) {
		if depth > 64 {
			return ExplainDetail{}, fmt.Errorf("explanation exceeds 64 levels")
		}
		var node struct {
			Description *string           `json:"description"`
			Value       *float64          `json:"value"`
			Details     []json.RawMessage `json:"details"`
		}
		if err := json.Unmarshal(data, &node); err != nil {
			return ExplainDetail{}, err
		}
		if node.Description == nil || node.Value == nil {
			return ExplainDetail{}, fmt.Errorf("each score node needs description and numeric value")
		}
		d := ExplainDetail{Description: *node.Description, Value: *node.Value}
		for _, item := range node.Details {
			child, err := decode(item, depth+1)
			if err != nil {
				return d, err
			}
			d.Children = append(d.Children, child)
		}
		return d, nil
	}
	root, err := decode(response.Explanation, 0)
	if err != nil {
		return nil, 0, err
	}
	return &ExplainResult{Index: response.Index, ID: response.ID, Matched: response.Matched, Explanation: root.Description, Details: root.Children}, root.Value, nil
}
func WriteExplain(w io.Writer, res *ExplainResult) {
	fmt.Fprintf(w, "Explain Result for %s/%s: matched=%v\n", res.Index, res.ID, res.Matched)
	var write func([]ExplainDetail, int)
	write = func(ds []ExplainDetail, depth int) {
		for _, d := range ds {
			fmt.Fprintf(w, "%s- %s (score=%.2f)\n", strings.Repeat("  ", depth), d.Description, d.Value)
			write(d.Children, depth+1)
		}
	}
	write(res.Details, 0)
}
func ShowExplain(res *ExplainResult) { WriteExplain(os.Stdout, res) }
