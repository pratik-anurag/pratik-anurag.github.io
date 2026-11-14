package analysis

import (
	"strings"
	"testing"
)

func TestRuntimeProfileInclusive(t *testing.T) {
	r, err := Analyze(`{"size":10,"query":{"match_all":{}}}`, `{"profile":{"shards":[{"id":"s0","searches":[{"query":[{"description":"parent","type":"BooleanQuery","time_in_nanos":100,"children":[{"description":"child","time_in_nanos":80}]}]}]},{"id":"s1","searches":[{"query":[{"description":"other","time_in_nanos":50}]}]}]}}`)
	if err != nil {
		t.Fatal(err)
	}
	if r.Runtime.TotalNanos != 150 || r.Runtime.MaxNanos != 100 || r.Runtime.Timings[0].Children[0].Nanos != 80 {
		t.Fatalf("%+v", r.Runtime)
	}
	if !strings.Contains(r.Report, "Profiling Summary:") {
		t.Fatal("upstream report absent")
	}
}
func TestExplainAndValidate(t *testing.T) {
	r, err := Analyze(`{"match":{"name":"shoe"}}`, `{"explain":{"_index":"products","_id":"p1","matched":true,"explanation":{"description":"product of:","value":6,"details":[{"description":"boost","value":2},{"description":"idf","value":3}]}},"validate":{"valid":false,"explanations":[{"error":"unknown field"}]}}`)
	if err != nil {
		t.Fatal(err)
	}
	if r.Runtime.Score.Value != 6 || len(r.Runtime.Score.Children) != 2 || r.Runtime.Validation.Valid {
		t.Fatal(r.Runtime)
	}
	if !strings.Contains(r.Report, "Root score: 6") || !strings.Contains(r.Report, "unknown field") {
		t.Fatal(r.Report)
	}
}
func TestSearchExplanation(t *testing.T) {
	r, err := Analyze(`{"match_all":{}}`, `{"hits":{"hits":[{"_id":"p1","_index":"products","_explanation":{"value":1,"description":"constant score","details":[]}}]}}`)
	if err != nil || r.Runtime.Score.Value != 1 {
		t.Fatal(r, err)
	}
}
func TestBadResponses(t *testing.T) {
	for _, raw := range []string{`{}`, `{"validate":{"valid":"yes"}}`, `{"explanation":{"details":[]}}`, `{"profile":{"shards":false}}`, `{"profile":{"shards":[{"searches":[{"query":[{"time_in_nanos":-1}]}]}]}}`, `{"profile":{"shards":[{"searches":[{"query":[{"description":"no time"}]}]}]}}`} {
		if _, err := Analyze(`{"match_all":{}}`, raw); err == nil {
			t.Fatalf("accepted %s", raw)
		}
	}
}
func TestEmptyProfile(t *testing.T) {
	r, err := Analyze(`{"match_all":{}}`, `{"profile":{"shards":[]}}`)
	if err != nil || r.Runtime.TotalNanos != 0 {
		t.Fatal(err)
	}
}
