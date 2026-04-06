# Implementation Backlog

## Purpose

This document turns the current TrustPlane roadmap and MVP contract into a concrete implementation queue.

The goal is not to enumerate every possible future task.
The goal is to define the next meaningful build buckets in a dependency-aware order.

## How to use this backlog

Each section below includes:

- priority
- why it matters
- dependencies
- suggested first tasks
- done-when criteria

This backlog should be updated as the runtime contract and first governed slice become more concrete.

## Priority 1 — Backend request snapshot contract

### Why it matters

The frontend needs a single stable request-centric shape to render.
Without this, the UI remains too tightly coupled to scenario-specific mock logic.

### Dependencies

- `minimum-viable-integration-surface.md`
- `request-lifecycle-state-model.md`

### Suggested first tasks

- define backend models for request, workflow state, trust state, pending action, verification state, and artifact summary
- create a single request snapshot response shape
- add one backend endpoint for request snapshot retrieval
- make one existing demo scenario return data in the new shape

### Done when

- the backend exposes one stable request snapshot payload
- the payload can drive the main request view without ad hoc frontend reshaping
- the shape matches the MVP contract docs closely enough to become the default

## Priority 2 — Timeline and event contract

### Why it matters

TrustPlane’s core product object is the execution record.
That requires a readable, stable event model.

### Dependencies

- backend request snapshot work
- `event-taxonomy.md`

### Suggested first tasks

- define event families and required event fields in backend models
- create one timeline endpoint
- map one scenario’s current internal events into the stable event taxonomy
- ensure the timeline includes approval, execution, and verification events

### Done when

- one request can be loaded with a timeline using stable event objects
- the event taxonomy is consistent across the backend and docs
- event summaries are operator-readable

## Priority 3 — Operator action endpoints

### Why it matters

TrustPlane should not remain a read-only explanation surface.
Bounded operator control is part of the product.

### Dependencies

- backend request snapshot contract
- request lifecycle state model

### Suggested first tasks

- add approve endpoint
- add deny endpoint
- add pause endpoint
- add resume endpoint
- ensure each action mutates backend-owned state rather than only frontend-local state
- emit timeline events when actions succeed

### Done when

- operator actions change request state through the backend
- timeline events are generated for approvals, denials, pauses, and resumes
- the frontend no longer needs to fake these transitions locally for the first slice

## Priority 4 — UI migration onto backend-owned state

### Why it matters

The UI needs to stop being the main source of scenario truth.

### Dependencies

- backend request snapshot contract
- timeline endpoint
- operator action endpoints

### Suggested first tasks

- update the main request view to consume the request snapshot payload
- update the timeline panel to consume backend event data
- update trust/decision/checkpoint panels to read backend-owned state
- keep the first scenario working while removing scenario-specific shaping from the UI

### Done when

- the main request surface is backend-driven for at least one scenario
- operator controls trigger backend actions
- the timeline and state updates reflect backend state changes

## Priority 5 — Governed intake object and normalization path

### Why it matters

TrustPlane’s own thesis says governance starts at intake.
That means the system needs more than a generic POST endpoint.

### Dependencies

- MVP contract docs
- request lifecycle state model

### Suggested first tasks

- define canonical intake payload shape
- store raw request and normalized request separately
- model clarification-needed state and missing-context fields
- assign candidate workflow and initial trust posture during intake normalization
- ensure intake-created requests land in the request snapshot shape

### Done when

- a raw request can enter the backend and produce a governed request object
- incomplete requests visibly land in clarification-needed state
- normalized requests are visible in the TrustPlane UI

## Priority 6 — Slack intake slice hardening

### Why it matters

A real external intake surface proves TrustPlane can govern real input, not only local demo state.

### Dependencies

- governed intake object and normalization path
- current Slack/OpenClaw/n8n bridge path

### Suggested first tasks

- define one supported Slack request family end to end
- harden dedicated intake-agent routing
- improve clarification handling for missing fields
- validate the normalized request contract against real Slack-originated requests
- surface Slack source metadata in the UI

### Done when

- one Slack-originated request type works end to end repeatedly
- the request is legible from intake through admission
- bridge failures are diagnosable

## Priority 7 — Trust state implementation

### Why it matters

TrustPlane’s differentiation depends on trust being visible, meaningful, and revocable.

### Dependencies

- request snapshot contract
- trust-rating-model.md
- event taxonomy

### Suggested first tasks

- implement visible trust tiers in backend models
- bind trust tier to delegation mode and execution mode
- expose trust rationale in request snapshots
- emit trust-change events when posture changes
- add restricted-mode handling to the request lifecycle

### Done when

- requests show current trust posture and why
- trust changes create visible control consequences
- restricted posture can be entered and rendered clearly

## Priority 8 — Verification and evidence linking

### Why it matters

Execution alone is not enough for TrustPlane’s product promise.
Outcome verification and evidence must remain visible.

### Dependencies

- request snapshot contract
- timeline contract
- trust state implementation

### Suggested first tasks

- implement verification state in backend models
- attach artifact summaries to request snapshots
- add verification pass/fail events
- link verification failure to restricted or review-required states
- ensure UI distinguishes execution from verification cleanly

### Done when

- execution does not directly imply success
- operators can see verification status and evidence references
- verification failures affect visible workflow posture

## Priority 9 — Human takeover and ownership transitions

### Why it matters

TrustPlane should clearly represent when the runtime stops owning the next step and a human takes over.

### Dependencies

- operator action endpoints
- request lifecycle state model
- trust state implementation

### Suggested first tasks

- add takeover action and state transition
- expose current owner consistently in request snapshots
- add ownership-change events to the timeline
- make human-takeover paths visible in UI state and event history

### Done when

- a request can move into human takeover
- current owner is always visible
- ownership transitions are recorded clearly

## Priority 10 — Operational hardening

### Why it matters

A control plane needs a boring bring-up path and understandable failure modes.

### Dependencies

- first end-to-end governed slice working

### Suggested first tasks

- document reproducible startup order
- improve health checks across backend, intake bridge, and supporting services
- improve error reporting across the Slack/n8n/TrustPlane handoff
- harden persistence and restart handling for the first real slice

### Done when

- the local system can be brought up repeatably
- the first governed slice can stay up without manual babysitting
- common failure modes are diagnosable

## Deliberately delayed work

These may matter later, but should not outrun the first credible slice:

- many workflow types
- broad connector matrix
- deep replay tooling
- full multi-runtime parity
- large analytics surfaces
- topology-heavy UI expansion
- generic service-desk features

## Summary

The highest-leverage implementation sequence remains:

1. backend request snapshot contract
2. timeline and event contract
3. operator action endpoints
4. UI migration onto backend-owned state
5. governed intake object and normalization path
6. Slack intake slice hardening
7. trust state implementation
8. verification and evidence linking
9. human takeover and ownership transitions
10. operational hardening

That sequence keeps TrustPlane focused on becoming a real governed control plane rather than a broader but blurrier system.
