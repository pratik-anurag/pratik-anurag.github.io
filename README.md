https://github.com/pratik-anurag/pratik-anurag.github.io

## EsPlain Playground

Static HTML/CSS/JavaScript in `playground/`, served on GitHub Pages at
[/projects/esplain/playground/](https://pratik-anurag.github.io/projects/esplain/playground/).
The frontend does not use a framework. It runs a Go WebAssembly engine in a
worker, never contacts Elasticsearch, and has no analytics or query uploads.
Only same-origin static assets are fetched on startup. Pasted data is not saved
to local storage. Sharing is explicit: the URL fragment includes query JSON
(`#q=base64`) and optionally response JSON (`&r=base64`). Fragments are not sent
in HTTP requests, but anyone with the link can read them.

### Build and run

Requires Go 1.27.1 (matching CI), Make, and Python 3. Node.js is used only for
tests; npm is not required to serve the standalone playground.

```sh
make wasm
python3 -m http.server 8000
# Open http://localhost:8000/playground/
```

`make wasm` builds `playground/esplain.wasm` with `-trimpath -ldflags="-s -w"`
and copies the matching Go `wasm_exec.js`. It fails if the binary exceeds 5 MiB.
Commit both files together. `make playground` builds and copies the complete
directory into `public/projects/esplain/playground/` for the portfolio export.
The existing Pages workflow runs Go tests, rebuilds the engine, tests Wasm,
copies the playground, builds Next.js, and deploys the static export.

```sh
go test ./...
make wasm
node scripts/test-wasm.cjs
# Same report as the browser's "Copy as text report":
go run ./cmd/esplain -query query.json -response response.json
# Original upstream cluster-backed CLI, still available:
go run ./cmd/esplain
```

The live CLI uses `ES_EXPLAIN_INDEX`, `ES_EXPLAIN_ID`, and the original client
configuration. Use the offline flags when no Elasticsearch cluster is available.

### What is reused, and what changed

Source was reviewed and adapted from
[`pratik-anurag/esplain` at `379b9303ccbb46f1b839d8011923ae043ec0a739`](https://github.com/pratik-anurag/esplain/tree/379b9303ccbb46f1b839d8011923ae043ec0a739).
This portfolio contains a local source snapshot; no changes were pushed to the
EsPlain repository.

- `explain.QueryTree`, recursive JSON traversal, `ExplainDetail`, the recursive
  explain parser, `nl.Summarize`, top-level profile flattening, report headings,
  and the 1 ms expensive-phase threshold come from that code.
- Network calls are in native-only files. The Wasm dependency graph has no
  Elasticsearch client. The original CLI and visualization packages remain.
- Map keys are sorted and report lines have newlines, fixing unstable ordering
  and concatenated output in upstream. A shared writer makes browser and offline
  CLI text reports identical (without terminal colors).
- Static findings and clause descriptions are additions: upstream did not have
  this rules engine. Profile children, checked response decoding, byte/depth/node
  bounds, and nil-safe summaries are additions too. This is a Go extension, not a
  JavaScript reimplementation.
- Upstream mentions validate in its README but does not implement it. The
  playground reads pasted validation responses; it does not claim to validate
  mappings or Elasticsearch semantics.

### Inputs and interpretation

Accepts a bare query clause or a search body with `query`, plus an optional
`_explain` response, full search response with `profile.shards`, search-hit
`_explanation` (first explained hit), direct validation response, or envelope:

```json
{"explain": {"matched": true, "explanation": {"value": 1, "description": "constant score", "details": []}}, "validate": {"valid": true}, "profile": {"shards": []}}
```

Unknown clauses retain their JSON tree and display "Unrecognized clause".
JSON syntax checking is not cluster validation. Scores are copied from the
response, not recomputed; product branches are not presented as percentages.
Profile bars use the sum of root query times as their denominator, never add
inclusive child times, and do not represent wall-clock search latency or all
Elasticsearch work. Synthetic preset responses demonstrate the formats and are
not benchmark results. Users must supply responses for the query they paste.

Each input is limited to 1 MiB, 64 JSON nesting levels, and 25,000 values.
Share fragments are limited to 64 KiB. Static heuristics warn at over 1,024 terms,
at least five levels of clause nesting, and `from + size > 10,000`.
The latter is the usual default result window, not a claim about every index.
Omitted `size` normally defaults to 10 hits. Exact-term checks on likely text
field names are informational because field mappings are unavailable. Queries
in filter context do not receive scoring warnings.

See [the short case study](content/esplain-playground-case-study.md).
