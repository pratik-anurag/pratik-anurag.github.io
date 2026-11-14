.PHONY: wasm test playground
wasm:
	GOOS=js GOARCH=wasm go build -trimpath -ldflags="-s -w" -o playground/esplain.wasm ./cmd/wasm
	cp "$$(go env GOROOT)/lib/wasm/wasm_exec.js" playground/wasm_exec.js
	@test $$(wc -c < playground/esplain.wasm) -lt 5242880 || (echo "Wasm exceeds 5 MiB"; exit 1)

test: wasm
	go test ./analysis ./explain ./profile ./nl
	node scripts/test-wasm.cjs

playground: wasm
	mkdir -p public/projects/esplain/playground
	cp playground/* public/projects/esplain/playground/
