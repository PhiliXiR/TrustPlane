# Request Lifecycle State Model

## Purpose

This document defines the first-pass governed lifecycle for a TrustPlane request.

The goal is not to model every future workflow.
The goal is to define a stable request-centric lifecycle that:

- starts at governed intake
- makes ambiguity visible
- supports human checkpoints
- supports execution visibility
- supports verification and downgrade
- keeps operator actions bounded and understandable

## Design principles

The lifecycle should:

- remain request-centric
- expose blocked reasons clearly
- make the current owner obvious
- make the next step obvious
- separate intake, execution, and verification concerns
- support restriction or downgrade when trust falls

The lifecycle should **not** assume:

- full autonomy by default
- a generic ticket workflow
- runtime-specific internals exposed directly to operators

## Core request states

### 1. `intake_received`

A raw request has entered the system but has not yet been normalized sufficiently for governed workflow admission.

Operator meaning:
- The system has the request.
- Intake handling has started.

Typical owner:
- `intake`

Allowed next transitions:
- `clarification_needed`
- `normalized`
- `denied`

### 2. `clarification_needed`

The request is missing required context or is too ambiguous to admit safely.

Operator meaning:
- The request is real, but not complete enough to proceed.
- The system is waiting on clarification.

Typical owner:
- `requester` or `intake`

Allowed actions:
- `request_clarification`
- `deny`
- `pause`

Allowed next transitions:
- `normalized`
- `denied`
- `paused`

### 3. `normalized`

The request has been converted into a governed request object with a candidate workflow and initial trust posture.

Operator meaning:
- Intake has completed enough normalization to admit the request into governed handling.

Typical owner:
- `runtime` or `operator`

Allowed next transitions:
- `admitted`
- `denied`
- `restricted`

### 4. `admitted`

The request is accepted into governed workflow handling and is now part of the active TrustPlane surface.

Operator meaning:
- The system understands the request and has accepted it into the control plane.

Typical owner:
- `runtime`

Allowed next transitions:
- `awaiting_review`
- `preparing_action`
- `restricted`
- `paused`

### 5. `awaiting_review`

The request needs human review before further action can proceed.

Operator meaning:
- A checkpoint is active.
- Human review is required before the request advances.

Typical owner:
- `operator`

Allowed actions:
- `approve`
- `deny`
- `pause`
- `take_over`

Allowed next transitions:
- `approved`
- `denied`
- `paused`
- `human_takeover`

### 6. `approved`

A human has approved the next governed step.

Operator meaning:
- The system is now allowed to continue along the approved path.

Typical owner:
- `runtime`

Allowed next transitions:
- `preparing_action`
- `executing`
- `verifying`

### 7. `preparing_action`

The runtime or execution layer is preparing a concrete next action.

Operator meaning:
- The system is translating the governed request into a specific executable step.

Typical owner:
- `runtime`

Allowed next transitions:
- `awaiting_review`
- `executing`
- `restricted`
- `paused`

### 8. `executing`

The prepared action is being executed.

Operator meaning:
- The request is currently affecting the target system or performing a controlled step.

Typical owner:
- `runtime` or `human_executor`

Allowed actions:
- `pause` (if supported)
- `take_over` (if supported)

Allowed next transitions:
- `verifying`
- `failed`
- `paused`
- `human_takeover`

### 9. `verifying`

The system is checking whether the executed step produced the intended result.

Operator meaning:
- Execution may be done, but the outcome is not yet trusted.

Typical owner:
- `runtime` or `verification`

Allowed next transitions:
- `completed`
- `failed`
- `restricted`

### 10. `completed`

The request reached a successful governed outcome with sufficient verification.

Operator meaning:
- The request is done.
- The current execution path is complete.

Typical owner:
- none

Allowed next transitions:
- none in the normal path

### 11. `failed`

The request failed to complete successfully, either during execution or verification.

Operator meaning:
- The system attempted the governed path but did not complete successfully.
- Review is likely needed.

Typical owner:
- `operator`

Allowed actions:
- `pause`
- `take_over`
- `downgrade_trust`

Allowed next transitions:
- `awaiting_review`
- `restricted`
- `human_takeover`

### 12. `paused`

The request is intentionally paused.

Operator meaning:
- Work is stopped for now.
- A human or system pause condition is active.

Typical owner:
- `operator`

Allowed actions:
- `resume`
- `deny`
- `take_over`

Allowed next transitions:
- `awaiting_review`
- `preparing_action`
- `executing`
- `human_takeover`
- `denied`

### 13. `restricted`

The request or workflow slice has entered a downgraded or suspended posture where normal delegation is no longer allowed.

Operator meaning:
- Trust has fallen or a safety condition has triggered.
- The previous delegated path is no longer allowed.

Typical owner:
- `operator`

Typical reasons:
- verification failure
- policy drift
- repeated exception handling
- trust-boundary violation
- repeated human takeover

Allowed actions:
- `take_over`
- `deny`
- `request_clarification`

Allowed next transitions:
- `human_takeover`
- `denied`
- `awaiting_review`

### 14. `human_takeover`

A human has taken explicit ownership of the next step or the rest of the request.

Operator meaning:
- The runtime is no longer the active execution owner for the governed path.
- A human is now responsible for forward progress.

Typical owner:
- `operator` or `human_executor`

Allowed actions:
- `pause`
- `deny`

Allowed next transitions:
- `verifying`
- `completed`
- `failed`
- `paused`

### 15. `denied`

The request was explicitly denied and will not proceed on the current path.

Operator meaning:
- The request is closed without execution.

Typical owner:
- none

Allowed next transitions:
- none in the normal path

## Recommended transition path for the first slice

For the first realistic access-request slice, the most common path should be:

1. `intake_received`
2. `clarification_needed` (if needed)
3. `normalized`
4. `admitted`
5. `awaiting_review`
6. `approved`
7. `preparing_action`
8. `executing`
9. `verifying`
10. `completed`

## Blocked reasons

Every non-terminal state should be able to explain whether the request is blocked and why.

Examples:

- clarification needed because required fields are missing
- awaiting review because policy requires approval
- paused because operator intervention was requested
- restricted because verification failed

Blocked reasons should be operator-readable and appear prominently in the UI.

## Current owner guidance

The owner model should remain simple in the first version.

Suggested owner values:

- `intake`
- `requester`
- `runtime`
- `operator`
- `human_executor`
- `verification`

The operator should always be able to tell:

- who currently owns the next step
- whether ownership changed recently
- whether the runtime, a human, or the requester is blocking progress

## Allowed operator actions by state

This table is intentionally small and first-pass.

| State | Primary operator actions |
|---|---|
| `clarification_needed` | `request_clarification`, `deny`, `pause` |
| `awaiting_review` | `approve`, `deny`, `pause`, `take_over` |
| `executing` | `pause`, `take_over` |
| `failed` | `pause`, `take_over`, `downgrade_trust` |
| `paused` | `resume`, `deny`, `take_over` |
| `restricted` | `take_over`, `deny`, `request_clarification` |
| `human_takeover` | `pause`, `deny` |

## Relationship to trust state

Request lifecycle state and trust state are related but not identical.

Examples:

- A request can be in `awaiting_review` while trust is `bounded`.
- A request can move to `restricted` because trust fell after a verification failure.
- A request can be in `human_takeover` even if the workflow class is generally trusted.

The lifecycle tracks request progress.
The trust model tracks the current autonomy and risk posture.

## Relationship to verification

TrustPlane should not treat execution success as sufficient.

A request should generally move through:

- `executing`
- `verifying`
- `completed`

rather than directly from execution to completion.

This keeps outcome trust visible.

## What is intentionally out of scope for this first state model

Not modeled in detail yet:

- branching sub-workflow trees
- multi-request dependency graphs
- retry loops and compensation loops
- multi-runtime coordination states
- fine-grained artifact ingestion sub-states

These can be added later if the first request-centric lifecycle remains stable.

## Summary

The first TrustPlane request lifecycle should make these things explicit:

- intake can be ambiguous
- requests are admitted into governed handling
- human review can block or allow progress
- execution is distinct from verification
- trust can be downgraded
- human takeover is a first-class path

That is enough to support a real first governed slice without overcomplicating the model.
