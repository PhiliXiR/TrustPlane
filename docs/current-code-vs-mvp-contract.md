# Current Code vs MVP Contract

## Purpose

This document maps the current TrustPlane implementation against the newer MVP contract docs.

The goal is to make the gap explicit so the next coding pass can be focused and low-ambiguity.

Reviewed areas:

- `backend/models.py`
- `backend/main.py`
- `backend/store.py`
- `backend/scenarios.py`
- `src/api.ts`
- `src/App.tsx`
- key request/timeline/decision/checkpoint/execution components

## Overall assessment

The current codebase is best understood as:

- a strong scenario-backed prototype
- already request-centric in spirit
- already rich enough to demonstrate governance concepts
- not yet aligned to the new MVP contract shape

The biggest gap is not lack of UI or data.
The biggest gap is that the current data model is still centered on a **scenario object** rather than a **request snapshot contract**.

## Backend alignment

## What already aligns well

### 1. Request-centric product shape exists conceptually

The current backend already models a top-level request-like object inside `RuntimeScenario`.

Current strengths:
- request title/state/owner/risk/autonomy are already present
- intake metadata exists
- trust model exists
- ownership exists
- delegation exists
- command envelope exists
- verification is represented indirectly through stages/timeline/events
- artifact visibility exists through inspection records

This means the backend is not starting from zero.
It already contains most of the raw material needed for the MVP contract.

### 2. Bounded operator actions already exist

Current action endpoints already support:
- approve
- deny
- pause
- resume
- release execution authority

That is a strong base for the MVP operator action surface.

### 3. Event streaming already exists

The current backend already exposes SSE via `/api/events` and publishes:
- runtime snapshots
- execution stream events

That means the live-update pattern is already proven.

### 4. Intake path already exists

The backend already has:
- `POST /api/intake`
- `POST /api/intake/slack`
- intake request persistence/projected scenario creation

So the intake bridge is not hypothetical.
It exists, even if the shape is not yet aligned to the MVP docs.

## What partially aligns

### 1. `RuntimeScenario` overlaps the MVP request snapshot, but is too scenario-heavy

`RuntimeScenario` currently includes:
- request
- trust model
- operators
- ownership
- delegation
- authority boundary
- execution substrate
- command envelope
- stages
- human checkpoints
- execution steps
- timeline
- inspections
- playbook

This is rich, but it is broader than the MVP request snapshot and still reflects a demo-scenario worldview.

Recommended interpretation:
- keep `RuntimeScenario` as an internal transitional object if helpful
- derive a new request snapshot DTO from it
- do not treat `RuntimeScenario` as the final public operator contract

### 2. Timeline exists, but taxonomy is older and less stable

Current timeline events use:
- `title`
- `detail`
- `category`
- `inspectionKey`

This is close, but the MVP taxonomy now expects:
- `family`
- `type`
- `summary`
- `timestamp`
- `actor`
- optional correlation/details/artifact refs

So the current timeline is useful, but not yet contract-stable.

### 3. Verification exists, but mostly as stage/timeline behavior

Verification is visible in:
- stages
- execution threads
- timeline events
- artifact inspection output

But it is not yet a first-class `verificationState` object in the backend response.

### 4. Artifact visibility exists, but not as a dedicated summary object

Artifacts currently appear through:
- inspection drawer content
- artifact timeline events
- stage language

But there is not yet a dedicated `artifactSummary` object in the API response.

## What is missing or misaligned

### 1. No first-class request snapshot endpoint yet

Current API shape:
- `GET /api/runtime`

Desired MVP shape:
- `GET /api/requests/:requestId`

The current runtime endpoint returns the whole scenario object rather than a request snapshot contract.

### 2. No dedicated timeline endpoint yet

Current timeline is bundled into the runtime snapshot.

Desired MVP shape:
- `GET /api/requests/:requestId/timeline`

The current bundled approach is fine for a prototype, but the separate endpoint will matter for clarity and future growth.

### 3. No dedicated workflow state object

Workflow state currently lives mostly in:
- `request.state`
- `stages`

The MVP docs now expect a dedicated workflow-state surface with:
- state
- state reason
- next step
- blocked
- blocked reason

### 4. No dedicated policy decision object in the response

Policy information exists, but mostly in:
- trust model language
- stage explanation/rule text
- inspection content
- timeline events

The MVP shape wants policy to be explicit and stable.

### 5. No dedicated trust state object matching the new contract

Current `TrustModel` contains:
- `level`
- `currentBoundary`
- `delegationRule`
- `downgradeRule`

That is good directionally, but the new MVP trust state expects:
- trust level
- delegation mode
- execution mode
- why
- downgrade triggers

### 6. No dedicated intake status object

Intake metadata exists under `request.intake`, but the MVP docs now distinguish:
- request
- intake status
- workflow state

The current shape conflates some of that into nested metadata.

### 7. Operator actions are not yet request-addressed

Current action endpoints are runtime-global:
- `/api/runtime/approve`
- `/api/runtime/deny`
- etc.

Desired MVP shape is request-addressed:
- `/api/requests/:requestId/approve`
- etc.

### 8. `release_execution_authority` is valuable but not yet well placed in the MVP surface

This action clearly matters for the current OpenShell/change-operator path.
But it does not yet sit cleanly inside the new minimal action vocabulary.

Recommendation:
- keep it as a temporary runtime-specific action
- later either fold it into approval/execution-state transitions or document it as a substrate-specific extension

## Frontend alignment

## What already aligns well

### 1. The UI is already organized around governed work

The current UI panels already map well to the product thesis:
- request header
- workflow rail
- decision explanation
- human checkpoints
- timeline
- inspection evidence
- command envelope
- execution trace
- playbook
- live execution

This is strong. The UI is not the problem.
It already reflects the intended product.

### 2. The UI is already backend-driven enough to migrate incrementally

The app already:
- fetches a runtime snapshot from the backend
- receives live events over SSE
- updates state from backend actions

So the migration path can be incremental rather than a full rewrite.

### 3. The request header already surfaces many MVP concepts

It already shows:
- request state
- owner
- risk
- autonomy mode
- intake summary
- trust boundary
- authority rules

That means a future request snapshot can slot into this panel without throwing away the UI concept.

## What partially aligns

### 1. Timeline UI is strong, but keyed to the old event model

`TimelinePanel` uses:
- `category`
- `title`
- `detail`
- `time`

It will need light adaptation to support:
- family/type/summary/actor/timestamp

This is a reshape, not a redesign.

### 2. Decision panel currently reads stage explanation rather than workflow/policy objects

`DecisionPanel` currently renders from `Stage`:
- explanation
- rule
- evidence
- next

That is useful today, but under the MVP contract it should likely read from a combination of:
- workflow state
- policy decision
- pending action

### 3. Inspection drawer is tied to inspection keys rather than artifact/evidence references

This is fine for the prototype, but eventually the evidence model should be more explicit and event-linked.

## What is missing or misaligned

### 1. The app still thinks in terms of "scenario" instead of "request"

Frontend state is currently centered on:
- `scenarioId`
- `RuntimeScenario`
- scenario switching

That is good for demoing.
It is not yet aligned to the request-snapshot-first MVP model.

### 2. Components still depend on broad scenario-shape types

Panels consume pieces of the large scenario object rather than narrower MVP DTOs.

That means the first frontend migration task should be:
- define a request snapshot type
- define a timeline event type aligned to the MVP taxonomy
- adapt panel props gradually

### 3. API client still targets runtime-global endpoints

`src/api.ts` currently targets:
- `/api/runtime`
- `/api/runtime/approve`
- etc.

This should eventually move toward:
- request snapshot endpoint
- request timeline endpoint
- request-scoped action endpoints

## Best first implementation cut

## Backend first cut

### Step 1
Add a request snapshot DTO layer in `backend/models.py`.

Do not remove `RuntimeScenario` yet.
Instead, define new response models for:
- request snapshot
- workflow state
- policy decision
- trust state
- pending action
- verification state
- artifact summary

### Step 2
Add a projector function in `backend/store.py` that converts the current `RuntimeScenario` into the new request snapshot shape.

### Step 3
Add:
- `GET /api/requests/{request_id}`
- `GET /api/requests/{request_id}/timeline`

Even if they are initially backed by the current scenario store.

### Step 4
Keep `/api/runtime` temporarily for compatibility while migrating the frontend.

## Frontend first cut

### Step 1
Add request-snapshot fetch functions alongside the current runtime fetch functions.

### Step 2
Migrate the highest-value panels first:
- `RequestHeader`
- `TimelinePanel`
- `DecisionPanel`

### Step 3
Introduce new frontend types for:
- request snapshot
- timeline event taxonomy

### Step 4
Keep the scenario-driven demo selector temporarily if useful, but decouple it from the main request-rendering contract.

## Specific file targets for the first coding pass

### Backend
- `backend/models.py`
  - add MVP response models
- `backend/store.py`
  - add projector functions
  - add request/timeline retrieval by request ID
- `backend/main.py`
  - add request snapshot + timeline routes
- `backend/scenarios.py`
  - leave mostly intact for now

### Frontend
- `src/api.ts`
  - add request snapshot and timeline fetch methods
- `src/runtime/` or `src/types`
  - add new request snapshot types
- `src/App.tsx`
  - switch the main load path for one view to request snapshot data
- `src/components/RequestHeader.tsx`
  - adapt to request snapshot
- `src/components/TimelinePanel.tsx`
  - adapt to new event taxonomy
- `src/components/DecisionPanel.tsx`
  - adapt to workflow/policy state rather than only stage

## Recommendations

### Keep
- scenario-backed seed data
- SSE streaming approach
- existing operator-facing UI composition
- current intake path as a bridge

### Change next
- public API shape
- event taxonomy
- request snapshot contract
- action endpoint scoping

### Delay
- removal of scenario scaffolding
- broad connector generalization
- deep replay tooling
- multi-runtime abstraction polish

## Implemented so far

The newer MVP contract is no longer only documented. The repo now has a real first migration slice in code.

Implemented in code:
- MVP request snapshot DTOs in the backend
- MVP timeline DTOs in the backend
- request snapshot projection from current scenario-backed state
- timeline projection from current scenario-backed state
- `GET /api/requests/{request_id}`
- `GET /api/requests/{request_id}/timeline`
- frontend request snapshot types
- frontend request timeline types
- request header migrated to prefer projected contract data
- timeline panel migrated to prefer projected contract data
- decision panel migrated to prefer projected contract data
- inspection drawer migrated to use projected event details when present
- intake spotlight card migrated to prefer projected intake/request data
- command envelope panel migrated to prefer projected pending-action context
- approval bar migrated to prefer projected state/action gating
- operator control panel migrated to prefer projected owner/trust/workflow context

Still not done:
- full replacement of scenario-global API usage
- removal of scenario-backed transitional shaping
- a more explicit backend-native evidence/artifact contract beyond projected summaries and inspection-key linkage
- deeper backend cleanup to reduce dependence on scenario-global internals behind the bridge

Newly implemented in a thin bridge form:
- request-scoped action endpoints for approve, deny, pause, resume, and release execution
- backend request-to-current routing helper for request-scoped actions
- backend request-context helper for request-facing reads/projections
- request-aware SSE payload enrichment for runtime snapshots and execution-stream events
- thin request-scoped stream endpoint at `/api/requests/{request_id}/stream`
- consolidated frontend request action helper path
- frontend now prefers the request-scoped stream when a request ID is available, with global stream fallback
- approval bar now prefers request-scoped actions when a request ID is available
- workflow rail and human checkpoints now derive contract-aware summaries from the request snapshot
- execution trace and playbook surfaces now prefer contract-derived summaries when a request snapshot exists
- inspection/evidence surfaces now derive contract-aware evidence summaries from request snapshot + projected event details

## Summary

The current code is close enough to the MVP docs that the next pass should continue the **adapter/projection migration**, but the center of gravity is shifting.

The main remaining gap is now less about visible UI migration and more about:
- stronger request-native evidence/artifact modeling
- reducing scenario-global assumptions behind the bridge
- continuing the backend transition from scenario-centric helpers toward request-native helpers
- deciding how much of the current global runtime stream should become truly request-native over time
- eventually shrinking the compatibility burden of the scenario-backed bridge

The most important implementation insight remains:

**keep the scenario-backed prototype internals for now, but continue introducing the request-snapshot contract on top of them.**

That is still the shortest path from current repo reality to the newer TrustPlane MVP shape.
