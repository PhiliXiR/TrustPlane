# Live Command Observability

## Purpose

This document describes how TrustPlane should support real-time visibility into command-line operator work.

The goal is to make command execution observable enough for real operator trust, not just post-hoc status reporting.

## Core principle

If operators work through command-line runtimes, TrustPlane should aim to show:

- command intent
- approval state
- command start
- live output
- completion state
- verification result

That visibility is part of the control plane.

## Why this matters

For governed CLI work, the trust-critical questions are often:

- what exact command is about to run?
- why is it allowed?
- has it been approved?
- what is it doing right now?
- what did it output?
- did it succeed?
- did verification pass?

If TrustPlane only shows final status, it misses much of the value of being an operator-facing control surface.

## Required observability layers

### 1. Command preview

Before execution, TrustPlane should expose:

- exact command or bounded command envelope
- working directory
- target runtime or host
- operator or owning agent
- approval requirement
- policy basis
- expected effect

This is the minimum required for trust-aware review.

### 2. Live execution stream

During execution, TrustPlane should expose:

- running state
- live stdout stream
- live stderr stream
- elapsed time
- waiting or blocked state
- optional operator controls such as pause, cancel, or takeover if supported

This is the real-time visibility layer.

### 3. Post-execution evidence

After execution, TrustPlane should expose:

- exit code
- completion status
- output summary
- resulting artifact references
- verification result
- rollback path or rollback outcome when relevant

This closes the operator loop.

## Suggested event model

The runtime adapter layer should normalize command activity into an event vocabulary like:

- `execution.command.prepared`
- `execution.command.approval_required`
- `execution.command.approved`
- `execution.command.started`
- `execution.stdout.chunk`
- `execution.stderr.chunk`
- `execution.command.completed`
- `execution.command.failed`
- `verification.started`
- `verification.completed`
- `verification.failed`
- `rollback.prepared`
- `rollback.executed`

This vocabulary is easier for TrustPlane to render than raw runtime internals.

## Backend responsibilities

The backend should:

### 1. Subscribe to runtime execution events

This may come from:

- subprocess streams
- PTY streams
- remote shell sessions
- ACP harness event feeds
- runtime websocket streams
- execution bus or queue subscribers

### 2. Normalize output

The backend should translate raw runtime events into TrustPlane’s operator-facing event model.

### 3. Stream to UI

The backend should deliver updates through:

- SSE
- WebSocket
- or another streaming transport

Polling is acceptable for prototypes, but real command observability wants streaming.

### 4. Attach metadata

Each command event should ideally retain:

- command id
- request id
- owning workflow stage
- operator/agent id
- timestamp
- policy basis
- approval context

## UI requirements

A good TrustPlane command observability surface should include:

### Live Execution panel

Potential fields:

- command
- owner
- runtime/host
- current status
- elapsed time
- output stream
- approval context
- verification state

### View modes

The UI should likely support:

- concise operator summary
- expanded raw stream view
- inspection drawer for full command details

### Relationship to workflow UI

Live command state should not replace workflow state.
It should sit beneath it.

The workflow answers:

- where are we in the governed process?

The live command panel answers:

- what is happening inside the current execution step?

## Redaction and visibility controls

Raw command output can contain sensitive material.

TrustPlane should plan for:

- output redaction rules
- hidden secret masking
- operator-role-based visibility rules
- separation between summary output and raw output

Examples of things that may need redaction:

- tokens
- secrets
- customer identifiers
- infrastructure internals
- sensitive file paths

## Execution envelope versus raw command

In some cases, TrustPlane should display:

- the exact raw command

In other cases, it may be safer to display:

- a bounded execution envelope
- parameterized command shape
- human-readable action summary

Example:

Instead of only:

```text
python policy_update.py --target vpn --mode tighten --group contractors
```

TrustPlane may also show:

- action: update VPN policy
- scope: contractors
- mode: tighten split tunnel policy
- rollback: prepared
- verification: queued

This helps operators understand the meaning, not just the syntax.

## Integration examples

### Local subprocess execution

The runtime can capture stdout/stderr directly and emit chunked events.

### PTY-backed operator session

The runtime can capture terminal output and forward line/chunk events to the adapter.

### ACP harness session

The ACP backend can expose runtime events or stream logs that the TrustPlane backend consumes and projects into operator-facing state.

### Remote shell/runtime

The adapter can subscribe to remote execution events and surface them through the same normalized model.

## Recommended first implementation path

A sensible incremental path would be:

### Phase 1

- show command preview
- show started/completed state
- show buffered output after completion

### Phase 2

- stream stdout/stderr live with SSE
- show elapsed status and running state

### Phase 3

- support operator controls such as cancel/pause/takeover
- add redaction modes and summary/raw toggles

### Phase 4

- integrate with real runtime adapters such as OpenClaw/OpenShell-style systems

## Summary

TrustPlane should support live command observability for command-line operators through:

- command preview
- live streamed output
- completion state
- verification state
- redaction-aware operator visibility

That makes the control plane suitable for real governed CLI work instead of just retrospective reporting.
