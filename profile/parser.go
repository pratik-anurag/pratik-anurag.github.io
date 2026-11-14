// Profile model and top-level flattening adapted from upstream EsPlain.
package profile

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"time"
)

type PhaseTiming struct {
	Name     string
	Duration time.Duration
}
type ProfileResult struct {
	Phases  []PhaseTiming
	MaxTime time.Duration
}

func Parse(raw []byte) (*ProfileResult, error) {
	var data struct {
		Profile struct {
			Shards []struct {
				Searches []struct {
					Query []struct {
						Description string `json:"description"`
						TimeInNanos int64  `json:"time_in_nanos"`
					} `json:"query"`
				} `json:"searches"`
			} `json:"shards"`
		} `json:"profile"`
	}
	if err := json.Unmarshal(raw, &data); err != nil {
		return nil, err
	}
	result := &ProfileResult{Phases: []PhaseTiming{}}
	for _, shard := range data.Profile.Shards {
		for _, search := range shard.Searches {
			for _, p := range search.Query {
				if p.TimeInNanos < 0 {
					return nil, fmt.Errorf("profile time cannot be negative")
				}
				d := time.Duration(p.TimeInNanos)
				result.Phases = append(result.Phases, PhaseTiming{Name: p.Description, Duration: d})
				if d > result.MaxTime {
					result.MaxTime = d
				}
			}
		}
	}
	return result, nil
}
func WriteCosts(w io.Writer, pr *ProfileResult) {
	fmt.Fprintln(w, "\nProfiling Summary:")
	for _, p := range pr.Phases {
		label := ""
		if p.Duration > time.Millisecond {
			label = " (expensive)"
		}
		fmt.Fprintf(w, "- %s: %d ns%s\n", p.Name, p.Duration.Nanoseconds(), label)
	}
	fmt.Fprintf(w, "\nMax phase duration: %v\n", pr.MaxTime)
}
func HighlightCosts(pr *ProfileResult) { WriteCosts(os.Stdout, pr) }
