//go:build !js

package explain

import (
	"context"
	"encoding/json"
	"github.com/elastic/go-elasticsearch/v7"
	"log"
	"os"
	"strings"
)

// CallExplain invokes the Elasticsearch _explain API.
// It expects environment variables ES_EXPLAIN_INDEX and ES_EXPLAIN_ID.
func CallExplain(raw string) *ExplainResult {
	index := os.Getenv("ES_EXPLAIN_INDEX")
	id := os.Getenv("ES_EXPLAIN_ID")
	if index == "" || id == "" {
		log.Fatalf("ES_EXPLAIN_INDEX and ES_EXPLAIN_ID must be set")
	}

	es, err := elasticsearch.NewDefaultClient()
	if err != nil {
		log.Fatalf("Error creating ES client: %s", err)
	}
	// build request body
	_ = map[string]interface{}{"query": json.RawMessage(raw)}
	// execute explain
	res, err := es.Explain(
		index,
		id,
		es.Explain.WithContext(context.Background()),
		es.Explain.WithBody(strings.NewReader(raw)),
	)
	if err != nil {
		log.Fatalf("Error calling Explain API: %s", err)
	}
	defer res.Body.Close()

	// parse response
	var resp map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&resp); err != nil {
		log.Fatalf("Error parsing Explain response: %s", err)
	}
	exRes := &ExplainResult{Index: index, ID: id}
	if matched, ok := resp["matched"].(bool); ok {
		exRes.Matched = matched
	}
	if explanation, ok := resp["explanation"].(map[string]interface{}); ok {
		exRes.Explanation = explanation["description"].(string)
		encoded, _ := json.Marshal(resp)
		if parsed, _, parseErr := ParseDetails(encoded); parseErr == nil {
			exRes.Details = parsed.Details
		}
	}
	return exRes
}
