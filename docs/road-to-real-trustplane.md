# Road to Real TrustPlane

## Purpose

This document turns the current TrustPlane vision into a practical build sequence.

TrustPlane is currently a mocked prototype.
The goal of this roadmap is to make the path toward a real governed control plane explicit without broadening the project into something vague or unfocused.

## Product thesis

TrustPlane should become the operator-facing trust and control plane for governed agent runtimes.

It is not meant to be:

- another agent framework
- another workflow builder
- another service desk
- another generic dashboard

It is meant to be the place where humans can:

- understand what the runtime is doing
- understand why it is allowed
- see where trust boundaries exist
- intervene when necessary
- gradually delegate more authority over time
- revoke or downgrade autonomy when trust falls

## Core principle

**The system that decides must also explain.**

TrustPlane exists to make that principle visible.

## Strategic orientation

### Runtime layer

NemoClaw / OpenShell or a similar substrate handles:

- agents
- sessions
- tool execution
- sandboxing
- internal orchestration
- execution permissions

### TrustPlane layer

TrustPlane handles:

- request-centric visibility
- workflow explanation
- human checkpoint visibility
- policy and trust boundary visibility
- execution trace visibility
- intervention controls
- autonomy / delegation visibility

### Adapter layer

A projection layer likely sits between runtime and UI.

That layer should:

- normalize runtime events
- build request-centric state
- expose a stable operator-facing contract

## Phase 0 — Current state

Current TrustPlane already has:

- a control-plane-oriented UI
- workflow rail
- decision explanation panel
- timeline panel
- inspection drawer
- playbook surface
- human checkpoint surface
- execution trace surface
- two runtime scenarios
- a runtime-shaped mock adapter
- integration contract docs

This is a good prototype foundation.

## Phase 1 — Lock the product thesis

### Goal

Prevent TrustPlane from drifting into a broader but weaker project.

### What to do

- keep the project request-centric
- keep it operator-facing
- keep trust/delegation as the center of gravity
- avoid broadening into generic ticketing or generic observability

### Deliverables

- concise product thesis doc
- concise “what TrustPlane is / is not” doc
- clear terminology around trust, delegation, approval, and execution

### Why this matters

A strong product thesis will make later technical choices much easier.

## Phase 2 — Tighten the governed runtime contract

### Goal

Define the minimum stable contract between runtime and TrustPlane.

### Must-have objects

- request
- workflow state
- policy decision
- trust / autonomy mode
- playbook
- pending tool action
- verification state
- artifact summary
- timeline events

### Must-have actions

- approve
- deny
- pause
- resume

### Must-have event families

- workflow events
- policy events
- human checkpoint events
- execution events
- verification events
- artifact events

### Deliverable

A reduced “minimum viable integration surface” doc derived from the broader integration contract.

### Why this matters

Without a stable runtime contract, TrustPlane stays a UI concept rather than becoming a real control plane.

## Phase 3 — Build a thin local API adapter

### Goal

Move TrustPlane from static scenario imports toward a runtime-facing architecture.

### What to build

A small local API layer that serves:

- current request snapshot
- timeline
- trust model
- playbook and policy state
- execution envelope
- approval or pause/resume actions

### Suggested endpoints

- `GET /api/runtime/:scenario`
- `GET /api/runtime/:scenario/timeline`
- `POST /api/runtime/:scenario/approve`
- `POST /api/runtime/:scenario/deny`
- `POST /api/runtime/:scenario/pause`
- `POST /api/runtime/:scenario/resume`
- optional SSE stream for updates

### Why this matters

This creates a cleaner bridge from:

- mocked UI

to:

- real runtime-connected control plane

It also forces better discipline around state shape and event semantics.

## Phase 4 — Make the UI consume live state changes

### Goal

Make TrustPlane feel like an actual runtime surface, not a static scenario viewer.

### What to do

- fetch scenario/runtime snapshots from the local adapter
- subscribe to updates via SSE or websocket
- let approval / deny / pause / resume actually mutate visible state
- let timeline and trust state respond to actions

### Why this matters

TrustPlane should feel:

- stateful
- reactive
- operator-driven

That is an important step toward realism.

## Phase 5 — Expand trust patterns, not workflow count

### Goal

Prove that TrustPlane understands multiple trust/delegation modes, not just multiple request types.

### Better expansions

Add scenarios that highlight distinct control patterns such as:

1. human-approved execution
2. human-executed risky change
3. bounded autonomous low-risk action
4. clarification-required ambiguous request
5. downgraded workflow after failed verification

### Less useful expansion

Avoid adding many unrelated workflows just for coverage.

### Why this matters

The real differentiator is the trust model, not raw scenario count.

## Phase 6 — Make trust mode dynamic

### Goal

Treat trust as a changing operational state rather than a static label.

### Possible trust states

- observe only
- suggest only
- human-approved execution
- human-executed change
- bounded autonomous execution
- downgraded / suspended

### What to add

- visible current trust mode
- reason for current mode
- what would increase autonomy
- what would reduce autonomy
- visible downgrade history

### Why this matters

This is one of the strongest long-term product ideas in TrustPlane.

## Phase 7 — Integrate with NemoClaw / OpenShell through a projection layer

### Goal

Replace mocked runtime data with real governed runtime projections.

### Recommended architecture

- runtime (NemoClaw / OpenShell)
- projection / adapter layer
- TrustPlane UI

### What the adapter must do

- map raw runtime data into request-centric views
- normalize event names into operator-safe vocabulary
- expose only what matters for trust, visibility, and intervention
- hide internals that are not operator-relevant

### Why this matters

TrustPlane should consume a stable control contract, not raw runtime internals.

## Phase 8 — Add operator memory and audit posture

### Goal

Make TrustPlane useful over time, not just for a single request.

### Useful additions later

- trust history per workflow class
- recent verification outcomes
- downgrade reasons
- operator notes or annotations
- audit review summaries
- artifact history

### Why this matters

Trust is not just earned once.
It is maintained, reviewed, and sometimes reduced.

## What not to do too early

Avoid these traps:

- turning TrustPlane into a generic workflow builder
- broadening into many loosely related workflows
- building a large backend before the runtime contract is stable
- integrating directly with raw runtime internals from the frontend
- focusing on generic dashboard polish instead of trust clarity
- treating confidence alone as a trust model

## Recommended next concrete steps

If the goal is to move in the strongest possible order, the best next sequence is:

### 1.
Write a concise product thesis doc

### 2.
Derive a smaller “minimum viable integration surface” from the current integration contract

### 3.
Build a tiny local TrustPlane API adapter

### 4.
Make the current controls mutate runtime state through that adapter

### 5.
Add one scenario that demonstrates dynamic trust downgrade or bounded autonomy

That sequence would move TrustPlane from:

- compelling prototype

to:

- credible control-plane concept with a believable runtime path

## Final framing

TrustPlane is strongest when it is treated as the surface where humans learn to trust, supervise, and gradually delegate real operational work to agent runtimes.

That means the product must stay focused on:

- intent
- authorization
- action
- verification
- evidence
- intervention
- autonomy level
- downgrade path

That is the road to a real TrustPlane.
