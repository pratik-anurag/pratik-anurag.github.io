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
LC_ALL=C lscpu -e=CPU,NODE,SOCKET,CORE,CACHE
LC_ALL=C lscpu -J
LC_ALL=C numactl --hardware
# Optional frequency hints for hybrid processors:
LC_ALL=C lscpu -e=CPU,NODE,SOCKET,CORE,CACHE,MAXMHZ
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

The command column is named `CACHE`; its displayed header is
`L1d:L1i:L2:L3` (or the available subset). See the
[util-linux column definitions](https://github.com/util-linux/util-linux/blob/master/sys-utils/lscpu.c).
Without instance counts, cache-size scope varies across lscpu versions, so the
summary keeps the raw size with "scope unknown" rather than claiming a per-core size.

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

## Ephor and Portik browser demos

Live paths: `/projects/ephor/demo/` and `/projects/portik/demo/`. The Projects
cards and detail pages link to both. They are plain HTML/CSS/ES modules, with
no telemetry, persistence, backend, or remote API calls. Ephor additionally loads
a bundled Rust/WebAssembly scanner. Its Content Security Policy allows only
same-origin asset loading and WebAssembly compilation; Portik disables network
connections. Clipboard writes happen
only when a visitor explicitly presses a copy button; clipboard reads are never
requested. Input is not encoded in URLs.

```sh
# Ephor build prerequisites: Rust 1.98.0 and its WebAssembly standard library
rustup toolchain install 1.98.0 --profile minimal --target wasm32-unknown-unknown
RUSTUP_TOOLCHAIN=1.98.0 make demos  # Rust + Node tests, then copy assets
npm run build               # portfolio static export, including both demos
python3 -m http.server 8000 --directory out
# http://localhost:8000/projects/ephor/demo/
# http://localhost:8000/projects/portik/demo/
```

The Pages workflow runs `make demos` before the portfolio build and checks the
exported entrypoints and engine files before deployment. For a lightweight local
preview, serve `public/` after `make demos` (portfolio navigation needs `out/`).

### Ephor: local secret-pattern scanner

Reviewed the [Ephor Python scanner at `a0faa12`](https://github.com/pratik-anurag/ephor/tree/a0faa12dac681ed067f9f996b9eae929628b31c0),
including `README.md`, `ephor.py`, and `main.py`. It loads YAML regex patterns,
returns the first rule that matches, and warns when the foreground application
is a recognized browser. The browser demo preserves first-rule warning semantics
but also lists additional matches with one-based line/column positions.

All **189 rules from all 87 builtin rule files** are bundled at pinned revision
[`2e6e7f3`](https://github.com/praetorian-inc/noseyparker/tree/2e6e7f36ce36619852532bbe698d8cb7a26d2da7/crates/noseyparker/data/default/builtin/rules):
including JWTs, their signing-secret patterns, and the formerly excluded AWS
and Google credential rules. Original patterns, rule IDs, categories, and
fixture-check counts are retained in `rules.js`; matching data is embedded in the
Wasm binary. No rule families are allowlisted or excluded.

The scanner uses Rust's `regex::bytes::RegexBuilder` with `unicode(false)`, the
16 MiB compiled-pattern limit, and Vectorscan-comment removal from upstream
`noseyparker-rules/src/rule.rs`. No ECMAScript regex translation is involved;
scoped flags, extended mode, anchors, and byte boundaries use the upstream
compiler settings. Cargo.lock pins the regex dependency and transitive versions.
This is the rule-matching portion, not Nosey Parker's entire Vectorscan/filtering,
collection, deduplication, or reporting pipeline, nor Ephor's Python regex engine.

The importer discovers all YAML files at the pinned directory, validates every
rule and all **573 upstream positive/negative fixtures** in the same native Rust
compiler, and fails rather than skipping unsupported rules. Fixture values are
passed over stdin and are never saved or distributed. CI checks every rule's
compilation in the actual Wasm binary, full manifest/embedded-data agreement,
coverage counts, and synthetic scanner regressions. Rule order is filename order
followed by YAML order; Ephor's native filesystem enumeration order is not stable.

Rules distinguish identifiers from secret patterns: a bucket name or account ID
is not necessarily a secret. Uncategorized/API-only patterns are marked
potentially sensitive, not assumed to be public identifiers. No credential
validity or JWT signature checking takes place. A
non-match is never presented as proof of safety. The warning dialog is explicitly
a simulation, not macOS paste interception; clearing affects only demo text.

Scanning runs in a disposable Web Worker after a 300 ms debounce. Limits: 256 KiB
UTF-8 input, 15 seconds for asset initialization, two seconds per scan, 500 findings.
The Wasm asset is approximately 1.2 MiB. Incomplete scans disable redacted
copying. Redaction replaces matched capture groups, merges overlapping spans,
and does not claim to remove unmatched secrets. No raw match values are echoed
in findings. Synthetic samples are not live credentials.

To regenerate the bundled data (build-time network access and authenticated `gh`
required; `npm ci` supplies the existing YAML parser, Rust runs fixture checks):

```sh
node scripts/sync-ephor-rules.cjs
make demos
```

Nosey Parker's Apache-2.0 license, NOTICE, and modification attribution are shipped
with the demo. Normal builds and runtime never fetch upstream rules.

### Portik: snapshot diagnosis

Reviewed [Portik at `c54972d`](https://github.com/pratik-anurag/portik/tree/c54972d2cf18bc93c02f8becb5f6bcf8f3b88bef):
README, `internal/model/model.go`, `internal/inspect/diagnose.go`, and CLI
`who`, `explain`, `kill`, `restart`, and common flag handling. `analyze.js` ports
the deterministic diagnostic branches: in-use, missing PID, multiple owners,
IPv6-only, loopback, TIME_WAIT, zombies, and supplied Docker mappings. The adapted
code's MIT license is included.

Six synthetic scenarios show a local server, Docker database, IPv6 listener,
TIME_WAIT, missing permissions, and multiple workers. Visitors can paste a real
single-report JSON object produced by `portik who --json 3000` or
`portik explain --json --docker 5432`. Flags intentionally precede the port to
match Go's flag parser; the native Docker diagnostic's example is reordered here
for that parser as well. Input is bounded to 256 KiB, 500 listeners, and 2,000
connections; malformed and inconsistent fields are rejected.

The viewer never scans sockets, collects PIDs, invents process parents, probes a
host, executes commands, or claims a port is currently free. Imported diagnostics
are not replayed: supported checks are recomputed. Live firewall, container/WSL/VM
environment, and OS UID checks are unavailable. The privileged-port hint instead
uses an explicitly supplied username; this is labeled as a browser difference.
IPv6-only is the upstream heuristic, not proof of the kernel's dual-stack setting.

Command previews use only validated numeric ports and fixed flags, never pasted
command lines. Kill/restart previews require a known, matching snapshot owner and
non-zombie PID. No `--force` or `--yes` flags are generated. This does not replace
the CLI's live safety checks. Docker host-PID operations are not presented as
container restarts; the latter requires an explicit native `--container` choice.
Text reports are a browser snapshot format, not claimed byte-for-byte CLI output.
