---
title: "GOMODCACHE CI notes"
description: "A quick checklist for treating the Go module cache as infrastructure instead of magic."
publishedAt: "2026-03-04"
category: "Go Tooling"
tags:
  - go
  - gomodcache
  - ci
featured: false
draft: false
---

## Keep straight

- `GOMODCACHE` is not `GOCACHE`
- cache keys should include Go version and `go.sum`
- private module access must work on clean runners
- deleting the mod cache is a test, not a fix

## Reminder

Warm caches improve speed, but clean-runner builds prove reproducibility.
