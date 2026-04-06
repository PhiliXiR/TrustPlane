# Minimum Viable Integration Surface

## Purpose

This document defines the smallest credible contract between:

- governed intake
- agent/runtime systems
- the TrustPlane backend adapter/projection layer
- the TrustPlane UI

The goal is to make TrustPlane buildable as a real operator-facing control plane without prematurely broadening the project.

This is the minimum surface needed to support:

- governed intake
- request-centric visibility
- trust/delegation visibility
- human checkpoints
- execution visibility
- verification visibility
- bounded operator action

## Design constraints

The minimum viable integration surface should:

- stay request-centric
- stay operator-facing
- expose trust and control concepts directly
- avoid leaking raw runtime internals into the UI
- support clarification before admission into execution flow
- keep event vocabulary stable even if runtime internals change

It should **not** try to define:

- the full runtime internals
- a general workflow engine
- a generic service-desk schema
- every future connector or workflow type

## Core object model

The minimum viable integration surface requires the following operator-facing objects.

### 1. Request

The request is the primary object in TrustPlane.

It represents a governed unit of work from intake through outcome.

Required fields:

- `requestId`
- `source`
- `sourceRef` (optional but recommended)
- `title`
- `rawRequest`
- `normalizedRequest`
- `currentState`
- `currentOwner`
- `workflowCandidate`
- `trustState`
- `delegationMode`
- `createdAt`
- `updatedAt`

Example:

```json
{
  "requestId": "req_3001",
  "source": "slack",
  "sourceRef": "slack:channel:C123:thread:1712345",
  "title": "Grant reporting dashboard access",
  "rawRequest": "Can I get access to the reporting dashboard?",
  "normalizedRequest": {
    "type": "access_request",
    "targetSystem": "reporting",
    "requestedEntitlement": "reporting.read",
    "businessReason": "weekly reporting review"
  },
  "currentState": "awaiting_approval",
  "currentOwner": "operator",
  "workflowCandidate": "access_request_standard",
  "trustState": "bounded",
  "delegationMode": "human_approved_execution",
  "createdAt": "2026-04-05T00:10:00Z",
  "updatedAt": "2026-04-05T00:12:00Z"
}
```

### 2. Intake Status

This captures the front-door governance state before or during admission.

Required fields:

- `intakeState`
- `clarificationNeeded`
- `missingContext`
- `candidateWorkflows`
- `initialTrustPosture`

Example:

```json
{
  "intakeState": "clarification_needed",
  "clarificationNeeded": true,
  "missingContext": ["requestedRole", "businessReason"],
  "candidateWorkflows": ["access_request_standard"],
  "initialTrustPosture": "human_approved_execution"
}
```

### 3. Workflow State

This is the current governed state of the request.

Required fields:

- `state`
- `stateReason`
- `nextStep`
- `blocked`
- `blockedReason`

Example:

```json
{
  "state": "awaiting_approval",
  "stateReason": "Pending human review before prepared entitlement change can be executed.",
  "nextStep": "Operator approves or denies the prepared action.",
  "blocked": true,
  "blockedReason": "Approval required by policy for this access request class."
}
```

### 4. Policy Decision

This describes why an action is allowed, blocked, or held.

Required fields:

- `decision`
- `basis`
- `requiresHumanReview`
- `policyRef` (optional but recommended)

Allowed values for `decision`:

- `allowed`
- `held`
- `blocked`

Example:

```json
{
  "decision": "held",
  "basis": "Reporting access requests require operator approval before execution.",
  "requiresHumanReview": true,
  "policyRef": "policy.access.reporting.v1"
}
```

### 5. Trust State

This describes the current trust posture of the workflow slice.

Required fields:

- `trustLevel`
- `delegationMode`
- `executionMode`
- `why`
- `downgradeTriggers`

Suggested trust levels:

- `untrusted`
- `observed`
- `bounded`
- `elevated`
- `restricted`

Example:

```json
{
  "trustLevel": "bounded",
  "delegationMode": "human_approved_execution",
  "executionMode": "prepared_only",
  "why": "Stable playbook, strong verification, moderate blast radius.",
  "downgradeTriggers": [
    "verification_failure",
    "policy_drift",
    "repeated_operator_takeover"
  ]
}
```

### 6. Pending Action

This captures the next runtime-prepared action relevant to operator control.

Required fields:

- `actionId`
- `actionType`
- `summary`
- `status`
- `preparedBy`
- `requiresApproval`

Optional but recommended:

- `rawEnvelope`
- `riskSummary`

Allowed values for `status`:

- `prepared`
- `approved`
- `denied`
- `executing`
- `completed`
- `failed`
- `canceled`

Example:

```json
{
  "actionId": "act_9001",
  "actionType": "entitlement_change",
  "summary": "Grant reporting.read to user U123 in reporting.",
  "status": "prepared",
  "preparedBy": "runtime",
  "requiresApproval": true,
  "riskSummary": "Moderate blast radius; human approval required."
}
```

### 7. Verification State

This captures whether the result has been confirmed.

Required fields:

- `status`
- `summary`
- `lastCheckedAt`

Optional but recommended:

- `evidenceRefs`
- `failureReason`

Allowed values for `status`:

- `not_started`
- `pending`
- `passed`
- `failed`

Example:

```json
{
  "status": "pending",
  "summary": "Awaiting reporting entitlement verification.",
  "lastCheckedAt": "2026-04-05T00:14:12Z",
  "evidenceRefs": []
}
```

### 8. Artifact Summary

This provides operator-facing visibility into the evidence attached to a request.

Required fields:

- `artifactCount`
- `artifactTypes`

Optional but recommended:

- `highlights`

Example:

```json
{
  "artifactCount": 2,
  "artifactTypes": ["verification_log", "policy_snapshot"],
  "highlights": [
    "Policy snapshot captured at approval time.",
    "Verification log attached after entitlement check."
  ]
}
```

### 9. Timeline Event

Timeline events are the stable, operator-facing event contract.

Required fields:

- `eventId`
- `requestId`
- `family`
- `type`
- `summary`
- `timestamp`
- `actor`

Optional but recommended:

- `details`
- `correlationId`
- `artifactRefs`

Example:

```json
{
  "eventId": "evt_12001",
  "requestId": "req_3001",
  "family": "human_checkpoint",
  "type": "human.approval.requested",
  "summary": "Operator approval required before entitlement change can proceed.",
  "timestamp": "2026-04-05T00:12:30Z",
  "actor": "policy",
  "details": {
    "policyRef": "policy.access.reporting.v1"
  }
}
```

## Minimum intake fields

The minimum intake surface should capture enough to support governed admission.

Required fields:

- `source`
- `rawRequest`
- `submittedAt`

Recommended fields:

- `sourceUserId`
- `sourceChannelId`
- `sourceThreadRef`
- `title`
- `attachments`
- `metadata`

At normalization time, the system should also derive:

- `normalizedType`
- `candidateWorkflows`
- `clarificationNeeded`
- `missingContext`
- `initialTrustPosture`

## Minimum operator actions

The first version of TrustPlane only needs a small set of bounded actions.

### Required actions

- `approve`
- `deny`
- `pause`
- `resume`

### Strongly recommended next actions

- `request_clarification`
- `take_over`
- `downgrade_trust`

Each action should produce a visible timeline event and a visible state transition when successful.

## Minimum event families

TrustPlane should stabilize event families early.

### Required event families

- `intake`
- `workflow`
- `policy`
- `human_checkpoint`
- `execution`
- `verification`
- `artifact`

### Strongly recommended next families

- `trust`
- `ownership`

## Minimum API surface

The specific routing can change, but the backend should minimally expose:

- request snapshot retrieval
- timeline retrieval
- bounded operator actions
- live updates

Example shape:

- `GET /api/requests/:requestId`
- `GET /api/requests/:requestId/timeline`
- `POST /api/requests/:requestId/approve`
- `POST /api/requests/:requestId/deny`
- `POST /api/requests/:requestId/pause`
- `POST /api/requests/:requestId/resume`
- optional `GET /api/requests/:requestId/stream`

## Minimum UI surface

The UI should always make these things obvious:

- what the request is
- where it came from
- current state
- current owner
- trust posture
- why the request is allowed, blocked, or held
- whether clarification is needed
- whether a human checkpoint is active
- what action is pending
- what happened recently
- whether verification has passed or failed

## Explicitly out of scope for this minimum surface

Not needed in the first minimum viable integration surface:

- multi-runtime parity
- deep replay tooling
- broad Slack command UX
- generic workflow builder features
- large ticketing schemas
- comprehensive analytics
- fully general connector abstraction

## Summary

The minimum viable integration surface for TrustPlane is the smallest request-centric, trust-aware contract that allows:

- intake normalization
- operator visibility
- bounded human control
- execution explanation
- verification visibility
- a stable event model

If this surface is stable, TrustPlane can grow without losing its center of gravity.
