# MVP API Shape

## Purpose

This document defines the first practical API shape for TrustPlane.

The goal is not to lock in every future endpoint.
The goal is to define a small, request-centric API that supports the first governed slice and matches the MVP integration surface.

## Design principles

The MVP API should:

- stay request-centric
- mirror the operator-facing contract
- support live state updates
- support bounded operator control actions
- avoid leaking raw runtime internals to the frontend

It should **not**:

- become a generic workflow engine API
- expose every internal runtime object directly
- require the frontend to assemble request state from too many tiny endpoints in the first slice

## Request snapshot endpoint

### `GET /api/requests/:requestId`

Returns the operator-facing request snapshot.

Example response:

```json
{
  "request": {
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
    "currentState": "awaiting_review",
    "currentOwner": "operator",
    "workflowCandidate": "access_request_standard",
    "createdAt": "2026-04-05T00:10:00Z",
    "updatedAt": "2026-04-05T00:12:00Z"
  },
  "intakeStatus": {
    "intakeState": "normalized",
    "clarificationNeeded": false,
    "missingContext": [],
    "candidateWorkflows": ["access_request_standard"],
    "initialTrustPosture": "human_approved_execution"
  },
  "workflowState": {
    "state": "awaiting_review",
    "stateReason": "Human review required before the prepared entitlement change can proceed.",
    "nextStep": "Operator approves or denies the prepared action.",
    "blocked": true,
    "blockedReason": "Policy requires approval before execution."
  },
  "policyDecision": {
    "decision": "held",
    "basis": "Reporting access requests require operator approval before execution.",
    "requiresHumanReview": true,
    "policyRef": "policy.access.reporting.v1"
  },
  "trustState": {
    "trustLevel": "bounded",
    "delegationMode": "human_approved_execution",
    "executionMode": "prepared_only",
    "why": "Stable playbook, strong verification, moderate blast radius.",
    "downgradeTriggers": [
      "verification_failure",
      "policy_drift",
      "repeated_operator_takeover"
    ]
  },
  "pendingAction": {
    "actionId": "act_9001",
    "actionType": "entitlement_change",
    "summary": "Grant reporting.read to user U123 in reporting.",
    "status": "prepared",
    "preparedBy": "runtime",
    "requiresApproval": true,
    "riskSummary": "Moderate blast radius; human approval required."
  },
  "verificationState": {
    "status": "pending",
    "summary": "Awaiting reporting entitlement verification.",
    "lastCheckedAt": "2026-04-05T00:14:12Z",
    "evidenceRefs": []
  },
  "artifactSummary": {
    "artifactCount": 1,
    "artifactTypes": ["policy_snapshot"],
    "highlights": ["Policy snapshot captured at approval time."]
  }
}
```

## Timeline endpoint

### `GET /api/requests/:requestId/timeline`

Returns operator-facing timeline events.

Example response:

```json
{
  "requestId": "req_3001",
  "events": [
    {
      "eventId": "evt_12001",
      "requestId": "req_3001",
      "family": "intake",
      "type": "intake.request.received",
      "summary": "Slack request received and queued for intake normalization.",
      "timestamp": "2026-04-05T00:10:00Z",
      "actor": "intake"
    },
    {
      "eventId": "evt_12002",
      "requestId": "req_3001",
      "family": "policy",
      "type": "policy.decision.changed",
      "summary": "Request requires human approval before execution.",
      "timestamp": "2026-04-05T00:12:00Z",
      "actor": "policy"
    },
    {
      "eventId": "evt_12003",
      "requestId": "req_3001",
      "family": "human_checkpoint",
      "type": "human.approval.requested",
      "summary": "Operator approval requested for prepared entitlement change.",
      "timestamp": "2026-04-05T00:12:10Z",
      "actor": "runtime"
    }
  ]
}
```

## Live updates endpoint

### `GET /api/requests/:requestId/stream`

Recommended initial transport:
- SSE

Suggested event payload shape:

```json
{
  "kind": "request_event",
  "requestId": "req_3001",
  "event": {
    "eventId": "evt_12004",
    "family": "execution",
    "type": "execution.change.started",
    "summary": "Prepared entitlement change has started execution.",
    "timestamp": "2026-04-05T00:13:00Z",
    "actor": "runtime"
  }
}
```

The stream may also emit a lightweight snapshot refresh signal:

```json
{
  "kind": "request_snapshot_updated",
  "requestId": "req_3001"
}
```

## Intake endpoint

### `POST /api/intake`

Accepts a raw inbound request for governed intake handling.

Example request body:

```json
{
  "source": "slack",
  "sourceUserId": "U12345",
  "sourceChannelId": "C12345",
  "sourceThreadRef": "1712345.6789",
  "rawRequest": "Can I get access to the reporting dashboard?",
  "submittedAt": "2026-04-05T00:10:00Z",
  "metadata": {
    "displayName": "Analyst User"
  }
}
```

Example response body:

```json
{
  "status": "accepted",
  "requestId": "req_3001",
  "intakeState": "intake_received",
  "clarificationNeeded": false
}
```

## Operator action endpoints

### `POST /api/requests/:requestId/approve`

Example request body:

```json
{
  "actor": "duty_operator",
  "comment": "Approved for standard reporting access."
}
```

Example response body:

```json
{
  "status": "ok",
  "requestId": "req_3001",
  "newState": "approved"
}
```

### `POST /api/requests/:requestId/deny`

Example request body:

```json
{
  "actor": "duty_operator",
  "comment": "Business justification was insufficient."
}
```

### `POST /api/requests/:requestId/pause`

Example request body:

```json
{
  "actor": "duty_operator",
  "comment": "Pausing until verification method is clarified."
}
```

### `POST /api/requests/:requestId/resume`

Example request body:

```json
{
  "actor": "duty_operator",
  "comment": "Resuming after policy clarification."
}
```

## Strongly recommended next action endpoints

Not required for the first thin slice, but likely next:

- `POST /api/requests/:requestId/request-clarification`
- `POST /api/requests/:requestId/take-over`
- `POST /api/requests/:requestId/downgrade-trust`

## Error shape

The MVP should keep errors simple and readable.

Example:

```json
{
  "error": {
    "code": "invalid_state_transition",
    "message": "Cannot approve request req_3001 while it is in completed state."
  }
}
```

## API design notes

### Prefer request snapshot over many tiny reads at first

For the first governed slice, the frontend should be able to render the main request surface from a single snapshot response.

### Keep action responses small

Action endpoints do not need to return the full updated request snapshot immediately.
They can return:

- success/failure
- new state
- request ID

and rely on:

- stream updates
- a follow-up snapshot fetch

### Avoid over-generalization early

The MVP API should remain focused on:

- one request object
- one timeline
- bounded actions
- one intake path
- one live stream

## Explicitly out of scope for the MVP API

Not required in the first shape:

- bulk query APIs
- analytics APIs
- workflow-builder APIs
- multi-runtime admin APIs
- generic artifact-search APIs
- advanced replay endpoints

## Summary

The MVP TrustPlane API should provide:

- one request snapshot endpoint
- one timeline endpoint
- one live update stream
- one intake endpoint
- four core operator action endpoints

That is enough to support a real first governed slice without prematurely broadening the backend surface.
