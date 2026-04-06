# First Implementation Cut

## Purpose

This document defines the smallest practical coding pass that would move TrustPlane toward the new MVP contract without forcing a rewrite.

The key idea is:

- keep the existing scenario-backed prototype internals for now
- introduce a new request-snapshot contract on top of them
- migrate the frontend incrementally

## Goals of the first implementation cut

This cut should achieve four things:

1. create a request-snapshot API that matches the MVP docs
2. create a timeline API aligned to the new event taxonomy
3. keep the current demo scenarios working
4. migrate the highest-value UI panels first

## Non-goals

This cut should **not** try to:

- remove the scenario model entirely
- rewrite all frontend components at once
- redesign the full data model for every future workflow
- solve full multi-runtime abstraction
- perfect the trust model implementation yet

## Implementation strategy

## Step 1 — Add new backend response models

### Files
- `backend/models.py`

### Add
New operator-facing response models for:
- `RequestSnapshot`
- `WorkflowState`
- `PolicyDecision`
- `TrustState`
- `PendingAction`
- `VerificationState`
- `ArtifactSummary`
- `RequestTimelineResponse`
- MVP-style `TimelineEvent`

### Why
This creates the new public contract without breaking the existing internal scenario objects.

## Step 2 — Add projector functions from `RuntimeScenario`

### Files
- `backend/store.py`

### Add
Projection helpers such as:
- `project_request_snapshot(scenario: RuntimeScenario) -> RequestSnapshot`
- `project_timeline(scenario: RuntimeScenario) -> RequestTimelineResponse`

### Why
This preserves current scenario data while creating the new request-centric API shape.

## Step 3 — Add request-addressed read endpoints

### Files
- `backend/main.py`

### Add
- `GET /api/requests/{request_id}`
- `GET /api/requests/{request_id}/timeline`
- optionally `GET /api/requests/{request_id}/stream` later

### How to implement the first version
Use the current in-memory/current-scenario store.
The first implementation can simply:
- find the currently selected request by ID
- or find the matching intake-projected scenario by intake request ID
- project the result through the new projector layer

### Why
This lets the frontend begin consuming the MVP contract immediately.

## Step 4 — Keep compatibility endpoints temporarily

### Files
- `backend/main.py`

### Keep for now
- `GET /api/runtime`
- `/api/runtime/*` mutation endpoints
- scenario switching path

### Why
This allows an incremental frontend migration and keeps the current demo surface alive.

## Step 5 — Add frontend request-snapshot types and API methods

### Files
- `src/api.ts`
- `src/runtime/` or `src/types`

### Add
- request snapshot TypeScript types
- timeline event taxonomy types
- `fetchRequestSnapshot(requestId)`
- `fetchRequestTimeline(requestId)`

### Why
This creates the client-side bridge into the new contract without breaking the current app immediately.

## Step 6 — Migrate the highest-value panels first

### First targets
- `RequestHeader.tsx`
- `TimelinePanel.tsx`
- `DecisionPanel.tsx`

### Why these first
They carry the most product meaning:
- request identity and trust posture
- event history
- workflow/policy explanation

### Migration guidance

#### `RequestHeader`
Move toward:
- request snapshot object
- trust state object
- intake status object

#### `TimelinePanel`
Move toward:
- MVP event taxonomy fields (`family`, `type`, `summary`, `timestamp`, `actor`)

#### `DecisionPanel`
Move away from reading only stage explanation.
Instead combine:
- workflow state
- policy decision
- pending action summary

## Step 7 — Defer the rest of the UI until the contract settles

### Delay for the next pass
- `InspectionDrawer`
- `ExecutionTracePanel`
- `HumanCheckpointsPanel`
- `WorkflowRail`
- `PlaybookCard`
- `OperatorControlPanel`

### Why
These can wait until the new request snapshot and timeline contract are proven in use.

## Suggested task breakdown by file

## Backend

### `backend/models.py`
- add new MVP DTOs
- keep `RuntimeScenario` and existing models intact for now

### `backend/store.py`
- add projector helpers
- add request lookup by request ID
- add timeline projection helper

### `backend/main.py`
- add request snapshot route
- add request timeline route
- keep runtime routes temporarily

### `backend/scenarios.py`
- no major structural change required in the first cut
- maybe add comments clarifying scenario-backed seed status

## Frontend

### `src/api.ts`
- add new fetch helpers for request snapshot and timeline
- keep old runtime helpers temporarily

### `src/App.tsx`
- add a transition path for loading request snapshot data
- preserve scenario switching until migration is stable

### `src/components/RequestHeader.tsx`
- adapt to new request snapshot shape first

### `src/components/TimelinePanel.tsx`
- adapt to new timeline event fields

### `src/components/DecisionPanel.tsx`
- adapt to workflow/policy state rather than only stage data

## First cut done-when criteria

The first implementation cut is successful when:

- the backend exposes a request snapshot endpoint
- the backend exposes a timeline endpoint
- both are projected from current scenario-backed data
- the frontend can render at least one request using the new request snapshot contract
- the timeline panel uses the new event vocabulary shape
- the old scenario-backed internals are still intact enough to preserve the demo

## Risks to avoid

### 1. Do not rewrite everything at once
The correct move is projection and migration, not total replacement.

### 2. Do not destroy the current demo surface prematurely
It is still useful as a proving ground while the new contract is introduced.

### 3. Do not let the new contract be defined only in docs
The first cut must make the new shapes real in code, even if only for one slice.

## Summary

The smallest valuable coding move now is:

- add MVP response DTOs
- project them from the existing scenario-backed store
- expose request snapshot and timeline endpoints
- migrate the highest-value UI panels first

That gives TrustPlane a real bridge from the current prototype to the newer request-centric contract without forcing a destabilizing rewrite.
