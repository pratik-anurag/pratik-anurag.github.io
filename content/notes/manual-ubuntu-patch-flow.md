---
title: "Manual Ubuntu patch flow"
description: "A compact flow for patching a vulnerable package manually without losing operational control."
publishedAt: "2026-03-07"
category: "Security Operations"
tags:
  - ubuntu
  - patching
  - security
featured: true
draft: false
---

## Flow

1. confirm the vulnerable package is installed
2. inspect current and candidate versions
3. review repository, pins, and holds
4. apply targeted upgrade
5. restart or reload affected services
6. verify runtime health and package version

## Reminder

Package state and running process state are not the same thing.
