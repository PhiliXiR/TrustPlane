# MVP Build Order

## Purpose

This document defines the highest-leverage build order for TrustPlane.

The goal is to move TrustPlane from:

- compelling prototype

into:

- credible governed control plane

without diluting the product into a broader but weaker system.

## Build principles

TrustPlane should prioritize:

1. request-centric clarity over workflow breadth
2. stable contracts over large implementation volume
3. real governance behavior over richer simulation
4. one excellent end-to-end slice over many partial slices
5. visible trust and control posture over generic dashboard polish

## The core rule

**Do not broaden the product faster than the core contract becomes real.**

That means:

- do not add many workflows just for demo variety
- do not turn Slack into a command-heavy product too early
- do not let the backend become a second runtime
- do not build a workflow builder
- do not confuse model confidence with governed trust

## Phase 1 — Freeze the MVP contract

### Goal

Make the smallest credible operator-facing TrustPlane contract explicit.

### Deliverables

- product thesis aligned across docs
- “what TrustPlane is / is not” clarified
- `minimum-viable-integration-surface.md`
- `request-lifecycle-state-model.md`
- stable vocabulary for request, trust, policy, verification, ownership, and events

### Why this comes first

Without a stable contract, all later implementation work risks drifting or overfitting to the current prototype.

### Exit criteria

- backend target is clear
- UI target is clear
- intake target is clear
- operator vocabulary is stable enough to code against

## Phase 2 — Build the thin adapter/projection backend

### Goal

Create the smallest backend layer that can project request-centric state and accept bounded operator actions.

### Deliverables

- request snapshot endpoint
- timeline endpoint
- approve/deny/pause/resume action endpoints
- live update stream (SSE or websocket)
- translation from runtime-ish state into TrustPlane vocabulary

### Why this comes second

This is the bridge from mock prototype to real control-plane behavior.

### Exit criteria

- UI can load request state from backend
- UI can load timeline from backend
- operator actions mutate backend-owned state
- state transitions generate timeline updates

## Phase 3 — Move the UI onto backend-owned request state

### Goal

Stop treating the frontend as the main source of request truth.

### Deliverables

- scenario views driven by backend request snapshots
- timeline driven by backend events
- trust state driven by backend data
- pending-action and verification surfaces driven by backend data

### Why this comes third

Once the backend contract exists, the UI needs to start behaving like a real operator surface.

### Exit criteria

- core UI panels are backend-driven
- request progression is no longer mostly hardcoded in frontend scenario logic
- the UI feels stateful rather than staged

## Phase 4 — Make governed intake real

### Goal

Treat intake as the beginning of governance, not just input collection.

### Deliverables

- canonical intake object
- raw request capture
- normalized request shape
- clarification-needed state
- missing-context tracking
- candidate workflow assignment
- initial trust posture assignment

### Why this comes fourth

TrustPlane’s own thesis says governance starts at intake. That means the front door has to become part of the real product.

### Exit criteria

- raw requests can enter the system in a governed way
- incomplete requests trigger visible clarification state
- normalized requests appear clearly in TrustPlane
- ownership and trust posture are visible from intake onward

## Phase 5 — Harden one Slack intake slice end to end

### Goal

Prove one real external-surface workflow from Slack into TrustPlane.

### Recommended first slice

- reporting access request

### Deliverables

- dedicated intake route tightened
- clarification loop for missing fields
- normalized request handoff into TrustPlane
- reliable local bridge behavior
- visible Slack source metadata in the UI

### Why this comes fifth

This proves a real governed intake surface without broadening too early.

### Exit criteria

- one Slack-originated request family works repeatedly end to end
- the request is understandable from raw intake through admission
- failures in the handoff path are visible and diagnosable

## Phase 6 — Implement dynamic trust and downgrade behavior

### Goal

Make trust visible, operationally meaningful, and revocable.

### Deliverables

- trust tiers wired into the product
- delegation/execution posture tied to trust level
- visible grant conditions
- visible downgrade triggers
- `restricted` or suspended-mode behavior
- trust-change timeline events

### Why this comes sixth

This is the product differentiator, but it only matters once request state and intake are real enough to support it.

### Exit criteria

- requests show current trust posture and why
- trust changes produce visible control consequences
- verification failure or drift can force a downgrade

## Phase 7 — Strengthen verification, evidence, and audit posture

### Goal

Make execution outcomes legible and reviewable.

### Deliverables

- verification-state model in real use
- evidence/artifact references linked to requests
- verification-driven completion logic
- verification failure handling
- stronger timeline explanation of action -> evidence -> outcome

### Why this comes seventh

Trust without visible outcome confirmation is incomplete.

### Exit criteria

- execution success is not treated as enough by itself
- operators can see what evidence supports completion
- failures can be traced and explained

## Phase 8 — Add human takeover and bounded autonomy patterns

### Goal

Support the most important governed control patterns beyond simple approval.

### Deliverables

- explicit human takeover path
- explicit human-executed risky change path
- bounded autonomous execution path
- ownership-change visibility
- trust impact from repeated takeovers or exception handling

### Why this comes eighth

This deepens the control-plane model after the basic trust and verification surfaces are working.

### Exit criteria

- delegated, human-approved, and human-takeover paths are all legible in the UI
- the operator can tell who owns the next step at all times

## Phase 9 — Strengthen event vocabulary and execution-record quality

### Goal

Make the execution record itself a stronger product object.

### Deliverables

- stable event taxonomy
- stronger causality/correlation between events
- clearer event summaries
- reduced event noise
- better request history readability

### Why this comes ninth

Once the first real slices work, the timeline and execution record should become more durable and audit-friendly.

### Exit criteria

- request histories are readable and reconstructable
- event families remain stable across slices
- execution records feel central, not incidental

## Phase 10 — Operational hardening and packaging

### Goal

Make TrustPlane boring to bring up and operate locally.

### Deliverables

- reproducible startup path
- service health checks
- clearer dependency handling
- better persistence and restart behavior
- better error visibility across the bridge path
- deployment docs aligned with reality

### Why this comes tenth

The product should be hardened after the core request/trust model is real enough to deserve hardening.

### Exit criteria

- the local system can be brought up repeatably
- common failure modes are diagnosable
- the first governed slice can run in steady state without manual babysitting

## What to delay deliberately

These may matter later, but should not outrun the core product:

- many workflows
- broad connector matrix
- deep replay tooling
- large analytics surfaces
- topology-heavy UI expansion
- generic service-desk behaviors
- full multi-runtime parity

## What to avoid entirely unless the thesis changes

Avoid building TrustPlane into:

- a workflow builder
- a generic ticketing product
- a second hidden agent runtime
- a generic observability dashboard
- a fake trust-scoring system with opaque numbers

## The shortest useful summary

If there is only enough focus for a narrow MVP sequence, do this in order:

1. freeze the contract
2. build the adapter backend
3. move the UI onto backend-owned state
4. make intake real
5. harden one Slack slice
6. make trust dynamic
7. make verification and evidence real

That sequence preserves the core idea while producing a believable path to a real TrustPlane.
