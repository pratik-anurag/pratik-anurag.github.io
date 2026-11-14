# EsPlain Playground

## Problem

Elasticsearch queries, score explanations, and profiler output are difficult to
read together. The EsPlain CLI parses these responses, but trying it normally
requires Go and access to an Elasticsearch cluster.

## Approach

The playground compiles EsPlain's Go parser and report code to WebAssembly.
Visitors paste a query and, optionally, a saved explain, validate, or profile
response. A Web Worker returns a clause tree, static findings, scores, timings,
and a text report. No query is sent to a server.

WebAssembly keeps the browser and offline CLI on the same Go implementation.
The original JSON AST and report headings are retained. New query-analysis rules
are explicit additions, and the original network-backed CLI remains available.

## Tradeoff

The Go engine is about 4.6 MB before compression. That initial download is larger
than a JavaScript implementation, but avoids maintaining two analysis engines.
Without mappings or a cluster, static findings cannot establish a field's type
or predict query latency.

## Next improvement

Allow an optional mapping JSON input so exact-term checks can use actual field
types instead of field-name hints. Compare reports against responses captured
from several Elasticsearch versions.

## Try it

[Open the playground](/projects/esplain/playground/) or
[read the CLI source](https://github.com/pratik-anurag/esplain).
