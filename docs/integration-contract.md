# TrustPlane Integration Contract

## Purpose

This document defines the minimum runtime contract TrustPlane would need in order to integrate with a governed agent runtime such as NemoClaw / OpenShell.

TrustPlane is not intended to replace the runtime.
It is intended to act as the operator-facing control plane around the runtime.

That means it needs the runtime to expose enough structure for TrustPlane to show:

- what is happening
- why it is allowed
- what happens next
- where a human can intervene
- what work is prepared or executed
- what evidence exists
- how the request was normalized and whether clarification is still required

## Architectural model

### Runtime layer

The runtime is responsible for:

- agents
- sessions
- tool execution
- approvals and gating behavior
- sandbox or execution context
- internal orchestration logic

Examples:

- NemoClaw
- OpenShell

### TrustPlane layer

TrustPlane is responsible for:

- operator-facing visibility
- request-centric workflow state
- decision explanation
- trust boundary visibility
- execution trace visibility
- approval and intervention controls

### Optional adapter layer

If the runtime does not already expose the right shape directly, an adapter/projection layer may sit between runtime and UI.

That adapter would:

- normalize runtime events
- build request-centric state snapshots
- expose a frontend-friendly API
- store or project the current workflow state if needed

## Core design principle

**The system that decides must also explain.**

For integration purposes, that means runtime behavior cannot remain entirely opaque.
The runtime must expose enough information for its decisions and boundaries to be inspected.

## Required runtime objects

TrustPlane does not need every internal runtime detail.
It does need a stable external contract.

### 1. Request object

A request is the top-level unit TrustPlane visualizes.

TrustPlane should conceptually own the governed intake layer for this request, even if the original user-facing entry surface is external.

Minimum fields:

```json
{
  "requestId": "req_1042",
  "title": "Grant access to reporting app",
  "type": "access_request",
  "status": "awaiting_approval",
  "owner": "iam-agent",
  "risk": "medium",
  "autonomyMode": "human_approved_execution",
  "createdAt": "2026-03-28T20:00:00Z",
  "updatedAt": "2026-03-28T20:03:00Z"
}
```

Purpose:

- primary header state
- request-centric UI identity
- current owner and status

### 2. Workflow state object

This object describes where the runtime believes the request is in the workflow.

Minimum fields:

```json
{
  "requestId": "req_1042",
  "workflowId": "access_request_standard",
  "workflowVersion": "1.4.2",
  "currentStage": "approval_check",
  "currentStageLabel": "Approval Check",
  "nextStage": "tool_execute",
  "stageStatus": "blocked_pending_approval"
}
```

Purpose:

- drive the workflow rail
- show current and next stage
- explain workflow progression

### 3. Policy decision object

TrustPlane needs a structured view of why the runtime is or is not allowed to proceed.

Minimum fields:

```json
{
  "requestId": "req_1042",
  "policyId": "pol_reporting_sensitive_02",
  "decision": "approval_required",
  "reason": "target dataset contains governed reporting information",
  "requiredApproverRole": "Reporting Data Owner",
  "delegationMode": "human_approved_execution"
}
```

Purpose:

- explain why the current step is allowed or blocked
- expose trust boundary logic
- show delegation mode or autonomy tier

### 4. Playbook object

TrustPlane should be able to show what governed workflow was selected.

Minimum fields:

```json
{
  "playbookId": "analytics-read-standard",
  "version": "1.4.2",
  "trigger": "Standard request for reporting read access",
  "allowedTools": ["directory.lookup", "reporting-access.grant", "access.verify"],
  "approvalRequirement": "Required before any write action",
  "rollback": "Remove entitlement and re-verify"
}
```

Purpose:

- connect workflow state to a governed execution template
- make runtime behavior feel controlled rather than improvised

### 5. Tool execution envelope

TrustPlane needs to show what concrete action is prepared or executed.

Minimum fields:

```json
{
  "requestId": "req_1042",
  "tool": "reporting-access.grant",
  "mode": "prepared_not_executed",
  "sandbox": "governed_runtime",
  "approvalRequired": true,
  "inputPreview": {
    "user": "analyst@company",
    "entitlement": "reporting.read"
  },
  "resultPreview": null
}
```

Purpose:

- show execution intent before execution occurs
- distinguish workflow movement from actual tool use
- make human review possible before write actions

### 6. Verification object

TrustPlane needs explicit post-condition state.

Minimum fields:

```json
{
  "requestId": "req_1042",
  "status": "pending",
  "expectedOutcome": "reporting.read granted and nothing broader",
  "verificationMethod": "readback_and_compare"
}
```

Purpose:

- show that execution is not the end of the workflow
- expose the difference between change and verified outcome

### 7. Artifact object

TrustPlane should surface the evidence produced by the workflow.

Minimum fields:

```json
{
  "requestId": "req_1042",
  "artifactType": "access_change_record",
  "status": "pending",
  "summary": "Will capture request basis, approval, execution, and verification outcome"
}
```

Purpose:

- evidence and auditability
- human-readable completion surface

## Required event stream

TrustPlane needs more than snapshots.
It also needs a readable event stream or timeline.

These do not need to be the runtime’s exact internal event names, but TrustPlane needs a stable mapped vocabulary.

### Minimum event families

#### Workflow events

- `workflow.entered_queue`
- `workflow.classified`
- `workflow.owner_assigned`
- `workflow.playbook_selected`
- `workflow.stage_changed`

#### Policy / trust events

- `policy.check.started`
- `policy.check.completed`
- `policy.decision.changed`
- `autonomy.mode.changed`

#### Human events

- `human.approval.requested`
- `human.approval.granted`
- `human.approval.denied`
- `human.clarification.requested`
- `human.clarification.received`
- `human.takeover.started`
- `human.takeover.completed`
- `human.execution.required`
- `human.execution.completed`

#### Execution events

- `execution.change.prepared`
- `execution.change.started`
- `execution.change.completed`
- `execution.change.failed`

#### Verification / evidence events

- `verification.check.started`
- `verification.check.passed`
- `verification.check.failed`
- `artifact.created`

### Event shape

Minimum event structure:

```json
{
  "eventId": "evt_3001",
  "requestId": "req_1042",
  "type": "human.approval.requested",
  "actor": "iam-agent",
  "timestamp": "2026-03-28T20:04:00Z",
  "summary": "Approval required before runtime may execute the prepared tool call"
}
```

Purpose:

- drive timeline UI
- support playback and inspection
- make decisions and boundaries legible

## Required control actions

TrustPlane is not just a read surface.
It should be able to trigger limited operator actions.

### Minimum actions

- approve pending request/action
- deny pending request/action
- pause workflow
- resume workflow

### Optional but useful later

- force human takeover
- downgrade autonomy mode
- retry failed verification
- request clarification
- rollback executed change

### Action shape

Example:

```json
POST /requests/req_1042/approve
{
  "actor": "reporting-data-owner",
  "comment": "Approved for weekly reporting access"
}
```

Purpose:

- make the control plane actually operative
- map UI controls to bounded runtime actions

## Read API surface

TrustPlane can work with REST + SSE/WebSocket, GraphQL, or another transport.
The important part is the shape, not the exact protocol.

A minimal read surface might include:

- `GET /requests/:id`
- `GET /requests/:id/workflow`
- `GET /requests/:id/policy`
- `GET /requests/:id/playbook`
- `GET /requests/:id/tooling`
- `GET /requests/:id/verification`
- `GET /requests/:id/artifacts`
- `GET /requests/:id/timeline`
- `GET /requests/:id/trust`

## Streaming surface

TrustPlane becomes much more useful with live runtime updates.

A minimal streaming surface should emit:

- workflow changes
- approval updates
- tool execution updates
- verification updates
- artifact creation
- autonomy mode changes

SSE is good enough for an early version.
WebSocket is also fine.

## What can remain internal to the runtime

TrustPlane does **not** need every internal runtime detail.
For example, the runtime can keep private:

- prompt internals
- internal chain-of-thought or hidden reasoning
- low-level scheduling details
- internal agent heuristics that are not part of the operator contract

The key distinction is:

- if a detail affects operator trust, review, or intervention, it probably needs to be visible
- if it does not, it can remain internal

## Adapter-layer recommendation

If NemoClaw / OpenShell does not currently expose these objects directly, the best integration path is likely:

### runtime -> projection/adapter -> TrustPlane UI

The adapter would:

- map runtime events into TrustPlane event vocabulary
- build request-centric snapshots
- preserve stable IDs for UI state
- expose a frontend-friendly contract

This is likely cleaner than trying to force the frontend to consume raw runtime internals directly.

## Summary

To integrate TrustPlane with NemoClaw / OpenShell, the core requirement is not just connectivity.
It is a governed runtime contract.

That contract must expose:

- request state
- workflow state
- policy decisions
- playbook identity
- tool execution envelopes
- verification state
- artifact state
- readable event history
- operator control actions

Once that contract exists, TrustPlane can stop being only a prototype and start acting as a real operator-facing control plane for governed agent workflows.
