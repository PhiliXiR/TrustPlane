# Intake Ownership

## Purpose

This document clarifies whether TrustPlane should own the intake layer.

## Short answer

Yes — TrustPlane should conceptually own the **governed intake layer**.

That does **not** necessarily mean it must own every external submission surface.
But it should own the logic that determines how incoming requests become governed runtime objects.

## Important distinction

### External intake surfaces

These may live elsewhere, for example:

- a chat interface
- an email parser
- a service portal form
- a Slack or Teams bot
- another request entry channel

TrustPlane does not need to own every one of these UIs.

### Governed intake layer

TrustPlane **should** own the layer that decides:

- what fields a valid request must contain
- how free text becomes a structured request
- how ambiguity is represented
- when clarification is required
- how initial risk is inferred
- what workflow candidates are eligible
- what trust/delegation posture exists before execution begins

That is part of the control plane.

## Why intake belongs here

Trust and governance do not begin at approval.
They begin at interpretation.

The first meaningful control questions are things like:

- what did the requester actually ask for?
- do we understand the target system?
- do we understand the requested action?
- is there enough context to proceed safely?
- do we need clarification before workflow selection?
- should this request even be admitted into an automated path yet?

Those are intake questions.

If TrustPlane does not own that layer conceptually, it risks only governing work after the most important ambiguity has already passed by.

## What TrustPlane should own in intake

### 1. Normalization

Transforming raw requests into structured runtime objects.

### 2. Ambiguity handling

Representing uncertainty explicitly instead of hiding it.

### 3. Clarification requirements

Showing when a human requester must clarify a field before routing or action.

### 4. Initial risk posture

Capturing the first trust and control posture before execution planning begins.

### 5. Workflow candidacy

Determining which workflows are eligible based on the normalized request.

## Example external intake surfaces

### Slack example

A user might submit something like:

> hey, can you give me access to the reporting dashboard before tomorrow’s review?

The Slack surface can remain a lightweight front door.
TrustPlane should own what happens next:

- extract target system: reporting dashboard
- infer likely request type: access request
- detect missing context if needed
- normalize the request into a controlled runtime object
- determine whether clarification is required before workflow selection
- determine initial trust/delegation posture

Example normalized request:

```json
{
  "source": "slack",
  "rawRequest": "hey, can you give me access to the reporting dashboard before tomorrow’s review?",
  "normalizedType": "access_request",
  "targetSystem": "reporting",
  "requestedEntitlement": "reporting.read",
  "clarificationNeeded": false,
  "candidateWorkflows": ["access_request_standard"],
  "initialTrustMode": "human_approved_execution"
}
```

### Jira example

A user might submit a structured Jira issue like:

- Summary: Update VPN access policy for remote contractors
- Description: tighten split tunnel rules before maintenance window
- Priority: High
- Change window: Saturday 22:00

In that case the intake surface is more structured from the start, but TrustPlane still owns:

- normalization into the runtime contract
- classification into infrastructure-change workflow
- risk posture
- whether human execution is required
- whether the request is complete enough to stage

Example normalized request:

```json
{
  "source": "jira",
  "rawRequest": {
    "summary": "Update VPN access policy for remote contractors",
    "priority": "High",
    "changeWindow": "Saturday 22:00"
  },
  "normalizedType": "infrastructure_change",
  "targetSystem": "vpn-policy",
  "clarificationNeeded": false,
  "candidateWorkflows": ["vpn_policy_standard_change"],
  "initialTrustMode": "human_executed_change"
}
```

### Why these examples matter

These examples show the intended boundary clearly:

- Slack and Jira can remain external entry surfaces
- TrustPlane owns the normalization, ambiguity handling, and governed admission logic

## Suggested future intake objects

TrustPlane will likely need intake-facing objects such as:

- raw request
- normalized request
- missing fields
- ambiguity state
- clarification needed
- candidate workflows
- selected workflow
- initial trust mode

## Summary

TrustPlane should not try to own every external request surface.

But it **should** own the governed intake layer that turns incoming requests into controlled runtime objects.

That makes intake part of the control plane rather than an afterthought.
