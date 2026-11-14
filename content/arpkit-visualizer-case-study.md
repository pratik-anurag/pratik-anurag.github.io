# Arpkit Visualizer

## Problem

Socket counts, cache sizes, CPU IDs, and NUMA distances are spread across command
output. It is difficult to see which threads share a physical core or an L3 cache,
especially on machines with several NUMA nodes per socket.

## Parsing challenges

The visualizer merges lscpu text, lscpu JSON, extended per-CPU tables, and numactl
output. Extended rows supply CPU-to-core and cache-ID mappings. Summary-only
captures cannot establish those relationships, so their groups are dashed and
labeled inferred. Socket-local core IDs are scoped by socket. Cache sizes marked
with instance counts are totals, and derived per-instance sizes are averages;
hybrid processors can have unequal cache sizes.

The diagram uses socket → NUMA → L3 → L2 → core → thread for navigation. Arpkit's
terminal view starts with NUMA → socket; both use the same underlying concepts.
Pasted memory-only nodes remain visible even when their socket is unknown.

## Posture

NUMA distance and memory-share checks use Arpkit's thresholds: a symmetric matrix
with maximum remote distance at most 30 passes, and memory-share spread at most
15 percentage points passes. Isolation and power governor stay unknown because
these command outputs do not contain them. The browser does not manufacture a
full CLI posture score. Additional SMT, cache-sharing, and memoryless-node
observations are explicitly labeled Visualizer extras.

## Next improvement

Import Arpkit's native JSON profile. It could provide exact cache sizes, isolation
settings, and power-governor data, removing several limitations of pasted command
output while keeping all processing in the browser.

[Open the visualizer](/projects/arpkit/visualizer/) or
[read Arpkit's source](https://github.com/pratik-anurag/arpkit).
