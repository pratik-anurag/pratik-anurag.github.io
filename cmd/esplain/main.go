package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"esplain/explain"
	"esplain/nl"
	"esplain/profile"
	"esplain/viz"
)

func liveCLI() {
	reader := bufio.NewReader(os.Stdin)
	fmt.Println("esplain - Elasticsearch Query Explainer CLI")
	fmt.Print("Enter ES query JSON: ")
	raw, err := reader.ReadString('\n')
	if err != nil {
		fmt.Fprintln(os.Stderr, "Error reading input:", err)
		os.Exit(1)
	}
	raw = strings.TrimSpace(raw)

	// 1. Parse and display query AST
	tree := explain.Parse(raw)
	explain.PrintTree(tree)

	// 2. Invoke _explain API
	explainRes := explain.CallExplain(raw)
	explain.ShowExplain(explainRes)

	// 3. Invoke _search?profile=true
	profRes, err := profile.CallProfile([]byte(raw))
	if err != nil {
		fmt.Fprintln(os.Stderr, "Error getting profile:", err)
		os.Exit(1)
	}
	profile.HighlightCosts(profRes)

	// 4. Generate natural language summary
	summary := nl.Summarize(tree, explainRes, profRes)
	fmt.Print("\nNatural Language Breakdown:\n", summary, "\n")

	// 5. Render CLI visualization and HTML report
	viz.RenderCLI(profRes)
	if err := viz.RenderHTML(tree, profRes, "esplain_report.html"); err == nil {
		fmt.Println("HTML report generated at esplain_report.html")
	}
}
