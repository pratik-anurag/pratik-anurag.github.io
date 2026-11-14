//go:build !js

package profile

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	elasticsearch7 "github.com/elastic/go-elasticsearch/v7"
	"io"
	"os"
	"time"
)

// CallProfile sends rawQuery to Elasticsearch with profiling enabled,
// parses the response, and returns the timing breakdown.
func CallProfile(rawQuery []byte) (*ProfileResult, error) {
	// 1) Which index?
	index := os.Getenv("ES_EXPLAIN_INDEX")
	if index == "" {
		return nil, errors.New("ES_EXPLAIN_INDEX must be set")
	}

	// 2) Build ES client config
	cfg := elasticsearch7.Config{}
	if url := os.Getenv("ES_URL"); url != "" {
		cfg.Addresses = []string{url}
	}
	if u := os.Getenv("ES_USERNAME"); u != "" {
		cfg.Username = u
		cfg.Password = os.Getenv("ES_PASSWORD")
	}
	es, err := elasticsearch7.NewClient(cfg)
	if err != nil {
		return nil, fmt.Errorf("creating ES client: %w", err)
	}

	// 3) Timeout context
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 4) Search with profiling (size=1)
	// Create search body with profile flag
	var searchBody struct {
		Query   json.RawMessage `json:"query"`
		Profile bool            `json:"profile"`
		Size    int             `json:"size"`
	}
	searchBody.Query = rawQuery
	searchBody.Profile = true
	searchBody.Size = 1

	// Encode the search body
	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(searchBody); err != nil {
		return nil, fmt.Errorf("encoding search body: %w", err)
	}

	res, err := es.Search(
		es.Search.WithContext(ctx),
		es.Search.WithIndex(index),
		es.Search.WithBody(&buf),
	)
	if err != nil {
		return nil, fmt.Errorf("executing profiled search: %w", err)
	}
	defer res.Body.Close()

	// 5) Handle HTTP errors
	if res.IsError() {
		var e map[string]interface{}
		if err := json.NewDecoder(res.Body).Decode(&e); err != nil {
			return nil, fmt.Errorf("decoding ES error: %w", err)
		}
		return nil, fmt.Errorf("Elasticsearch error: %v", e)
	}

	data, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	return Parse(data)
}
