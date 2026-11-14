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

## Arpkit Visualizer

Framework-free, browser-only topology viewer in `visualizer/`, published at
[/projects/arpkit/visualizer/](https://pratik-anurag.github.io/projects/arpkit/visualizer/).
There are no runtime API requests, uploads, analytics, third-party assets, or
local-storage persistence. CSP blocks network connections. Only the page and its
same-origin modules/styles load. SVG and PNG exports are generated locally.

### Supported input

Paste one or several captures into the same textarea:

```sh
LC_ALL=C lscpu
LC_ALL=C lscpu -e=CPU,NODE,SOCKET,CORE,L1d:L1i:L2:L3
LC_ALL=C lscpu -J
LC_ALL=C numactl --hardware
# Optional frequency hints for hybrid processors:
LC_ALL=C lscpu -e=CPU,NODE,SOCKET,CORE,L1d:L1i:L2:L3,MAXMHZ
```

Extended CPU rows establish sibling and cache-sharing membership. Plain text or
JSON summaries provide totals but not exact membership: inferred groups have
dashed outlines and explicit labels. Unknown IDs remain unknown; sample captures
are synthetic and anonymized, not measurements of a visitor's machine.
Core IDs and cache IDs are scoped by socket. NUMA nodes spanning a shared cache
show slices of the same group. Cache sizes with instance counts are aggregate
totals; displayed per-instance values are averages, not proof of equal sizes.
P-like/E-like shading uses two distinct max-frequency clusters on a matching Intel
model and is labeled inferred; model name alone does not establish core types.

The diagram is arranged socket → NUMA → cache → core → thread, while Arpkit's
terminal diagram is arranged NUMA → socket → core → thread.
Large L3 groups collapse by default. Focus, hover, or select a CPU to inspect
siblings and cache sharing. Press Escape to clear. The structured-list disclosure
provides a text alternative. Node color is supplemented by labels and outlines.

### Source and posture semantics

Reviewed [Arpkit at `d4ba57a17eb42ba7b2cc8beeab0cc924cfa6e7f4`](https://github.com/pratik-anurag/arpkit/tree/d4ba57a17eb42ba7b2cc8beeab0cc924cfa6e7f4):
`README.md`, `internal/topology/model.go`, `builder.go`,
`internal/parser/cpulist.go`, `internal/numa/distance.go`, and
`internal/posture/posture.go`. This is a JS port of the relevant deterministic
rules and terminology, not an attempt to run Linux sysfs collection in a browser.
The adapted code's MIT notice is retained in `visualizer/LICENSE`.

NUMA balance checks symmetry and warns above a maximum off-diagonal distance
of 30. Memory symmetry warns when node shares differ by more than 15 percentage
points. Missing or incomplete input stays unknown; unlike the CLI's early
single-pool defaults, absent captures do not count as evidence of a single pool.
Isolation and power governor cannot be established from these inputs, so they
remain unknown and no full posture score is computed. SMT, multiple nodes, split
LLCs, specific distant pairs, and CPU-less/memoryless nodes are labeled
**Visualizer extras**, separate from the four Arpkit posture checks.
NUMA distances are relative firmware costs, not measured latency multipliers.
The heatmap shows up to 32 nodes; the text summary retains the supplied matrix.
Pinning commands use only verified CPU IDs, and memoryless nodes never receive
a `--membind` recommendation.

### Run and test

```sh
python3 -m http.server 8000
# Open http://localhost:8000/visualizer/
node --test visualizer/tests/*.test.js
make visualizer
# Copies static assets to public/projects/arpkit/visualizer/ for Next export.
```

No frontend build, npm install, or bundler is required for the standalone viewer.
Node 20+ runs the tests. The existing Pages workflow runs these tests and copies
assets before building the portfolio.

Limits: 1 MiB input, 8,192 CPUs, 256 nodes, and a 128 KiB URL fragment. Share links
use gzip + base64 when CompressionStream is available, or UTF-8 base64 otherwise.
Decompression is bounded to 1 MiB. URL fragments do not reach the web server,
but anyone with a shared link can read the capture.
SVG exports expand all cores and preserve cache-level toggles. PNG exports use
the same vector layout with a 16-megapixel / 16,384-pixel height cap; extremely
large diagrams may be scaled down. SVG is preferable for large hosts.

See [the short case study](content/arpkit-visualizer-case-study.md).
