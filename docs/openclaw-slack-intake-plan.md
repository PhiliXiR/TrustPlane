# OpenClaw Slack Intake Plan

## Purpose

This document defines a concrete plan for using OpenClaw as the Slack-facing intake agent for TrustPlane.

The goal is to test a real external intake path without prematurely expanding into a full messaging or execution platform.

## Core idea

OpenClaw acts as the conversational intake agent in Slack.

TrustPlane acts as the operator-facing control plane that receives the normalized request and shows:

- request source
- clarification state
- workflow candidacy
- trust posture
- ownership and handoff

## Test goal

The first test should prove this end-to-end path:

1. user sends a request in Slack
2. the intake agent receives it
3. the intake agent asks clarification questions if needed
4. the intake agent creates a normalized request object
5. the intake path sends that object to TrustPlane backend
6. TrustPlane displays the request in a governed request view

That is enough for the first meaningful intake test.

## Current status note

The Linux prototype now has:

- a working generic TrustPlane intake endpoint
- a separate intake-agent workspace on the host machine
- a live Slack channel/provider setup on the host machine
- a working intake agent path on the host machine
- a working watcher path that detects intake payloads from the intake session store
- a working local `n8n` normalization/handoff path into TrustPlane

The practical implemented flow is now:

1. a user sends a request in Slack
2. the dedicated intake agent receives it
3. the intake agent can ask clarification questions if needed
4. the intake agent emits the handoff payload into the intake/watcher path
5. the watcher forwards it to `n8n`
6. `n8n` normalizes/packages the intake object and submits it into TrustPlane
7. TrustPlane receives the request and projects it into the governed view

So this is no longer just a plan in the abstract.
The intake agent path is implemented and working in the current Linux setup.

What remains is mainly:

- hardening
- operational packaging
- reducing brittle assumptions in the bridge
- continuing to improve the TrustPlane-side runtime-backed projection

## First request family

Start with one narrow request type:

- reporting app access request

Why this is the best first slice:

- already represented in TrustPlane scenarios
- easy to understand
- bounded enough for intake normalization
- easy to route into an access workflow later

## Success criteria

The first Slack intake slice is successful if:

- a user can ask for reporting access in Slack
- OpenClaw can identify or request missing fields
- OpenClaw can normalize the request into structured form
- TrustPlane can receive and display it
- the resulting request is understandable from an operator perspective

## Architectural responsibilities

### OpenClaw

Owns:

- Slack message handling
- conversational clarification
- intake normalization
- packaging and sending the structured request

Does not own:

- final approval decisions
- risky execution
- full operator control workflow

### TrustPlane backend

Owns:

- intake API endpoint
- request object persistence or projection
- workflow candidate representation
- trust/delegation posture projection
- operator-facing state model

### TrustPlane UI

Owns:

- intake source visibility
- raw request visibility
- normalized request visibility
- clarification-needed state visibility
- ownership and trust posture visibility

## Proposed phases

## Phase 1 — define intake payload contract

Before wiring Slack, freeze the minimum request object OpenClaw should send.

### Suggested payload shape

```json
{
  "source": "slack",
  "userId": "U12345",
  "channelId": "C12345",
  "rawRequest": "Can I get access to the reporting dashboard?",
  "requester": "alice@example.com",
  "normalizedType": "access_request",
  "targetSystem": "reporting",
  "requestedEntitlement": "reporting.read",
  "businessReason": "weekly dashboard review",
  "clarificationNeeded": false,
  "missingFields": [],
  "candidateWorkflows": ["access_request_standard"],
  "initialTrustMode": "human_approved_execution"
}
```

### Minimum required fields

- source
- rawRequest
- requester identity or Slack user reference
- normalizedType
- targetSystem
- clarificationNeeded
- missingFields
- candidateWorkflows
- initialTrustMode

## Phase 2 — prepare OpenClaw intake agent definition

OpenClaw is now configured in practice as a dedicated intake agent path on the Linux host.

This phase is therefore partially complete in implementation terms, even if the surrounding docs and operational packaging still need cleanup.

### Needs

- intake agent identity
- Slack-facing bot role
- clarification-first prompt
- explicit prohibition on risky execution
- instruction to produce normalized request objects

### Behavioral rules

- ask short clarification questions when required
- do not invent missing fields
- do not self-approve requests
- do not claim operator authority
- hand off structured requests to TrustPlane

## Phase 3 — stand up minimal Slack scope

Keep the scope tiny.

### Recommended first setup

- one Slack workspace
- one Slack app/bot
- one DM surface or one dedicated intake channel
- one request family

This keeps integration noise low.

## Phase 4 — add TrustPlane intake endpoint

TrustPlane now has the narrow intake endpoint in place.

### Proposed endpoint

```http
POST /api/intake/slack
```

### Input

A normalized intake object from OpenClaw.

### Output

Example response:

```json
{
  "status": "accepted",
  "requestId": "req_3001",
  "clarificationNeeded": false
}
```

## Phase 5 — display intake state in TrustPlane

TrustPlane UI should display, at minimum:

- source badge = Slack
- raw request
- normalized request summary
- clarification-needed state
- candidate workflow
- current owner
- trust posture

This is enough to show that the request has successfully crossed from chat into the control plane.

## Phase 6 — optional second step

Once intake handoff works, add one downstream path:

- hand off the reporting access request into the reporting-access governed execution scenario

This would prove:

- Slack intake
- governed request creation
- control-plane visibility
- operator approval path
- streamed execution path

That is the first full miniature system loop.

## Manual test script

### Test 1 — happy path

1. User messages Slack bot: `Can I get access to the reporting dashboard?`
2. OpenClaw asks for any missing detail if needed
3. User responds
4. OpenClaw submits normalized request to TrustPlane
5. TrustPlane shows new request with source = Slack

### Test 2 — ambiguous request

1. User messages Slack bot: `Give me admin on the dashboard`
2. OpenClaw asks for missing environment and reason
3. Request remains clarification-needed until those fields are filled
4. TrustPlane shows clarification-needed state if submitted early or after partial normalization

## What to avoid

Avoid these in the first pass:

- supporting many request families
- using Slack as the main control plane
- jumping straight to real execution
- trying to solve all Slack UX edge cases
- blending intake and operator authority together

## Risks

### Risk 1 — overbuilding Slack behavior

The first slice should be intake only.

### Risk 2 — weak payload contract

If the handoff object is underspecified, downstream control state becomes muddy.

### Risk 3 — blurred ownership

OpenClaw should remain the intake agent.
TrustPlane should remain the operator-facing trust/control layer.

## Immediate next deliverables

The basic intake-agent path now exists, so the practical next sequence has shifted.

The higher-value next steps are:

1. tighten docs so they reflect the implemented intake-agent + watcher + `n8n` path
2. harden the Slack -> intake agent -> watcher -> `n8n` -> TrustPlane chain operationally
3. reduce brittle assumptions in routing and payload handoff
4. improve TrustPlane’s request-native projection of the resulting intake objects
5. broaden only after the reporting-access-style slice remains stable

## Summary

The right first OpenClaw + Slack + TrustPlane experiment was:

- one Slack intake agent
- one narrow access-request workflow
- one clarification loop
- one normalized handoff object
- one TrustPlane-visible request state

That path is now implemented in the current Linux setup through the intake agent + watcher + `n8n` bridge.

The work left is not "make the intake agent exist."
The work left is to harden, simplify, and operationalize the implemented path without losing the governed-intake shape.
