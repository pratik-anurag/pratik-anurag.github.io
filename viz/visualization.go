package viz

import (
	"fmt"
	"os"
	"strings"
	"time"

	"esplain/explain"
	"esplain/profile"
	"github.com/fatih/color"
	"github.com/jedib0t/go-pretty/v6/table"
)

// RenderCLI outputs profiling phases and values as a CLI table with highlighted rows.
func RenderCLI(pr *profile.ProfileResult) {
	tw := table.NewWriter()
	tw.SetOutputMirror(os.Stdout)
	tw.AppendHeader(table.Row{"Phase", "Duration"})
	for _, ph := range pr.Phases {
		// format duration
		dur := ph.Duration
		durStr := fmt.Sprintf("%v", dur)

		// highlight the slowest
		if dur == pr.MaxTime {
			durStr = color.RedString("%v", dur)
		} else {
			durStr = color.GreenString("%v", dur)
		}

		tw.AppendRow(table.Row{ph.Name, durStr})
	}
	tw.Render()
}

// RenderHTML writes an HTML report including query AST and profiling table.
func RenderHTML(qt *explain.QueryTree, pr *profile.ProfileResult, filename string) error {
	var sb strings.Builder
	sb.WriteString("<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>esplain Report</title></head><body>")
	sb.WriteString("<h1>Query AST</h1><pre>")
	writeTreeHTML(&sb, qt, 0)
	sb.WriteString("</pre><h1>Profile Data</h1><table border=\"1\"><tr><th>Phase</th><th>Time(ms)</th></tr>")
	for _, p := range pr.Phases {
		color := "green"
		// costly if in top 20%
		if p.Duration >= time.Duration(float64(pr.MaxTime)*0.8) {
			color = "red"
		}
		durationMs := float64(p.Duration.Milliseconds())
		sb.WriteString(fmt.Sprintf("<tr><td>%s</td><td style=\"color:%s;\">%.2f</td></tr>", p.Name, color, durationMs))
	}
	sb.WriteString("</table></body></html>")

	f, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer f.Close()
	_, err = f.WriteString(sb.String())
	return err
}

// writeTreeHTML recursively writes the QueryTree as HTML
func writeTreeHTML(sb *strings.Builder, node *explain.QueryTree, level int) {
	indent := strings.Repeat("&nbsp;&nbsp;", level)
	if node.Value != "" {
		sb.WriteString(fmt.Sprintf("%s- %s: %s<br>", indent, node.Name, node.Value))
	} else {
		sb.WriteString(fmt.Sprintf("%s- %s<br>", indent, node.Name))
	}
	for _, child := range node.Children {
		writeTreeHTML(sb, child, level+1)
	}
}
