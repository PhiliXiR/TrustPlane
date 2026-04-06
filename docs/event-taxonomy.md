# Event Taxonomy

## Purpose

This document defines the first stable operator-facing event taxonomy for TrustPlane.

The goal is not to preserve every low-level runtime event.
The goal is to create a readable, request-centric event vocabulary that can survive changes in runtime internals.

## Design principles

The TrustPlane event model should:

- remain request-centric
- stay operator-readable
- distinguish governance events from raw execution detail
- preserve enough structure for audit and playback
- map cleanly from runtime-specific events through an adapter/projection layer

It should **not**:

- expose every internal runtime event directly
- depend on one runtime’s naming conventions
- force the UI to interpret raw execution internals

## Event shape

Each TrustPlane event should minimally include:

- `eventId`
- `requestId`
- `family`
- `type`
- `summary`
- `timestamp`
- `actor`

Recommended additional fields:

- `details`
- `correlationId`
- `artifactRefs`
- `owner`
- `trustState`

Example:

```json
{
  "eventId": "evt_3001",
  "requestId": "req_1042",
  "family": "human_checkpoint",
  "type": "human.approval.requested",
  "summary": "Operator approval required before the prepared entitlement change can proceed.",
  "timestamp": "2026-04-05T00:12:00Z",
  "actor": "policy",
  "correlationId": "corr_901",
  "details": {
    "policyRef": "policy.access.reporting.v1"
  }
}
```

## Naming pattern

Events should follow a stable pattern:

- `<family>.<action>.<status>` where useful
- or a short, readable equivalent when the extra suffix adds noise

Examples:

- `intake.request.received`
- `intake.clarification.requested`
- `workflow.stage.changed`
- `policy.decision.changed`
- `human.approval.granted`
- `execution.change.prepared`
- `verification.check.failed`
- `trust.level.changed`
- `artifact.created`
- `ownership.assigned`

## Required event families for MVP

### 1. `intake`

Events about request entry, normalization, and clarification.

Examples:

- `intake.request.received`
- `intake.request.normalized`
- `intake.clarification.requested`
- `intake.clarification.received`
- `intake.request.admitted`
- `intake.request.denied`

Use these when:
- a request enters the system
- missing context is identified
- clarification resolves ambiguity
- the request becomes governed workflow state

### 2. `workflow`

Events about request progression through governed lifecycle state.

Examples:

- `workflow.state.changed`
- `workflow.stage.changed`
- `workflow.playbook.selected`
- `workflow.blocked`
- `workflow.resumed`

Use these when:
- the request progresses or stalls in the governed path
- the selected playbook or current stage changes

### 3. `policy`

Events about policy evaluation and control posture.

Examples:

- `policy.check.started`
- `policy.check.completed`
- `policy.decision.changed`
- `policy.block.applied`

Use these when:
- the system evaluates whether the next step is allowed
- the policy basis changes the visible control posture

### 4. `human_checkpoint`

Events where human review or intervention is required or performed.

Examples:

- `human.approval.requested`
- `human.approval.granted`
- `human.approval.denied`
- `human.pause.applied`
- `human.resume.applied`
- `human.takeover.started`
- `human.takeover.completed`

Use these when:
- a human must approve, deny, pause, resume, or take over

### 5. `execution`

Events describing prepared, running, completed, or failed actions.

Examples:

- `execution.change.prepared`
- `execution.change.started`
- `execution.change.completed`
- `execution.change.failed`
- `execution.command.streamed`

Use these when:
- a concrete tool or runtime action is prepared or performed
- operator-visible live execution updates occur

### 6. `verification`

Events describing post-condition checks and outcome validation.

Examples:

- `verification.check.started`
- `verification.check.passed`
- `verification.check.failed`
- `verification.mismatch.detected`

Use these when:
- the system confirms or disputes the expected outcome

### 7. `artifact`

Events describing evidence creation or attachment.

Examples:

- `artifact.created`
- `artifact.attached`
- `artifact.updated`

Use these when:
- records, logs, evidence, or summaries become available

## Strongly recommended next event families

### 8. `trust`

Events about trust posture changes.

Examples:

- `trust.level.changed`
- `trust.restricted.entered`
- `trust.restriction.cleared`

Use these when:
- trust posture changes what the system is allowed to do

### 9. `ownership`

Events about who owns the next step.

Examples:

- `ownership.assigned`
- `ownership.transferred`
- `ownership.released`

Use these when:
- responsibility moves between intake, runtime, operator, requester, or human executor

## Event-family guidance

### Intake vs workflow

Use `intake` when the request is still being clarified, normalized, or admitted.
Use `workflow` once the governed request is inside the active request lifecycle.

### Policy vs trust

Use `policy` for the immediate allow/hold/block reasoning.
Use `trust` for the broader autonomy/delegation posture that can change over time.

### Human checkpoint vs ownership

Use `human_checkpoint` for decisions and interventions.
Use `ownership` when the responsibility for the next step changes.

### Execution vs verification

Do not collapse these together.
An action being executed is not the same as its outcome being verified.

## Event detail guidance

The `summary` should always be readable on its own.

The `details` field can carry structured context such as:

- policy reference
- workflow ID
- action ID
- trust rationale
- verification method
- artifact identifiers

The UI should not require deep inspection to understand the basic meaning of an event.

## Correlation guidance

Use `correlationId` to connect related events such as:

- policy check started -> policy decision changed
- execution prepared -> approval granted -> execution started -> execution completed
- verification started -> verification failed -> trust restricted entered

This will matter later for replay and audit views.

## Minimal event set for the first governed slice

For the first real slice, TrustPlane should support at least:

- `intake.request.received`
- `intake.request.normalized`
- `intake.clarification.requested`
- `workflow.stage.changed`
- `policy.decision.changed`
- `human.approval.requested`
- `human.approval.granted`
- `human.approval.denied`
- `execution.change.prepared`
- `execution.change.started`
- `execution.change.completed`
- `verification.check.started`
- `verification.check.passed`
- `verification.check.failed`
- `artifact.created`

## What to avoid

Avoid:

- low-level runtime event spam in the operator timeline
- runtime-specific names leaking directly into the UI contract
- numeric event codes without readable type names
- collapsing review, execution, and verification into one generic event stream

## Summary

TrustPlane’s first event taxonomy should provide a stable, readable layer over runtime behavior.

The MVP event families are:

- intake
- workflow
- policy
- human_checkpoint
- execution
- verification
- artifact

With `trust` and `ownership` added as soon as the first governed slice becomes more real.
