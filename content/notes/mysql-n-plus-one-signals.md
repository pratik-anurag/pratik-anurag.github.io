---
title: "MySQL N+1 signals"
description: "Short notes for spotting N+1 behavior before it turns into a database fire drill."
publishedAt: "2026-03-05"
category: "Databases"
tags:
  - mysql
  - n-plus-one
  - performance
featured: true
draft: false
---

## Signals

- repeated query template with changing IDs
- query count grows with collection size
- request DB time rises even when individual queries look indexed
- ORM serializers trigger hidden relationship loads

## Reminder

An N+1 issue is often an application design problem with database symptoms.
