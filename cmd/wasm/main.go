//go:build js && wasm

package main

import (
	"encoding/json"
	"esplain/analysis"
	"fmt"
	"syscall/js"
)

var bridge js.Func

func main() {
	bridge = js.FuncOf(func(_ js.Value, args []js.Value) (out interface{}) {
		defer func() {
			if recover() != nil {
				out = `{"error":"Input could not be analyzed safely."}`
			}
		}()
		if len(args) < 1 {
			return `{"error":"A query is required."}`
		}
		response := ""
		if len(args) > 1 && args[1].Type() == js.TypeString {
			response = args[1].String()
		}
		result, err := analysis.Analyze(args[0].String(), response)
		if err != nil {
			b, _ := json.Marshal(map[string]string{"error": err.Error()})
			return string(b)
		}
		b, err := json.Marshal(result)
		if err != nil {
			return fmt.Sprintf(`{"error":%q}`, err.Error())
		}
		return string(b)
	})
	js.Global().Set("explainQuery", bridge)
	select {}
}
