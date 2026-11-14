package main

import (
	"esplain/analysis"
	"flag"
	"fmt"
	"os"
)

func main() {
	query := flag.String("query", "", "query JSON file for offline analysis")
	response := flag.String("response", "", "optional combined runtime response JSON file")
	flag.Parse()
	if *query == "" {
		liveCLI()
		return
	}
	q, err := os.ReadFile(*query)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	var r []byte
	if *response != "" {
		r, err = os.ReadFile(*response)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
	}
	result, err := analysis.Analyze(string(q), string(r))
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	fmt.Print(result.Report)
}
