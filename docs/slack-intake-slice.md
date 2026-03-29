# Slack Intake Slice

## Purpose

This document defines the smallest sane Slack integration slice for TrustPlane.

The goal is to connect a real external intake surface without prematurely expanding into a full messaging product.

## Core principle

The first Slack integration should prove only one thing:

A request can begin in Slack, be clarified if needed, become a normalized governed request object, and appear inside TrustPlane.

That is enough for the first external-surface experiment.

## What this slice should include

### In scope

- one Slack bot or Slack-facing intake agent
- one narrow request family
- one bounded clarification loop
- one normalized request object
- one handoff into TrustPlane-visible runtime state

### Out of scope

- full Slack command surface
- broad multi-workflow orchestration
- complete ticketing behavior
- real production access execution
- large-scale Slack UX design

## Recommended first request family

Use one simple workflow first:

- reporting app access request

Why:

- already modeled in TrustPlane
- bounded and understandable
- easy to normalize
- easy to explain in the UI

## Minimal user flow

### Step 1 — user asks in Slack

Example:

> Can I get access to the reporting dashboard?

### Step 2 — intake bot evaluates completeness

The bot should look for required fields such as:

- target system
n- requested scope or role
- business reason
- timing if relevant

### Step 3 — clarification if needed

If information is missing, ask one or two short questions.

Example:

> Which reporting environment do you need access to?
> Is this for regular dashboard review, investigation, or admin work?

### Step 4 — normalized request object is created

Example shape:

```json
{
  "source": "slack",
  "rawRequest": "Can I get access to the reporting dashboard?",
  "normalizedType": "access_request",
  "targetSystem": "reporting",
  "requestedEntitlement": "reporting.read",
  "clarificationNeeded": false,
  "candidateWorkflows": ["access_request_standard"],
  "initialTrustMode": "human_approved_execution"
}
```

### Step 5 — request appears in TrustPlane

TrustPlane should show:

- source = Slack
- raw request
- normalized request
- clarification state
- selected workflow candidate
- current owner
- trust posture

## Architectural shape

### Slack side

A Slack-facing intake bot handles:

- message receipt
- lightweight clarification loop
- request packaging

### TrustPlane backend side

The backend handles:

- intake normalization contract
- request creation
- state projection
- handoff into the runtime/request model

### TrustPlane UI side

The UI renders:

- request appearance
- intake/clarification state
- ownership
- trust/delegation posture

## Minimum backend additions likely needed

The backend will likely need:

- an intake request creation endpoint
- a request source field
- raw request capture
- normalized intake fields
- clarification-needed state
- source metadata for UI display

## Example API shape

Possible minimal endpoint:

```http
POST /api/intake/slack
```

Example payload:

```json
{
  "channel": "slack",
  "userId": "U12345",
  "text": "Can I get access to the reporting dashboard?"
}
```

Response could be:

```json
{
  "status": "accepted",
  "requestId": "req_3001",
  "clarificationNeeded": true
}
```

## Suggested first UI additions

The first Slack-linked TrustPlane UI should minimally show:

- intake source badge
- raw request block
- normalized request block
- clarification-needed indicator

These are more important than richer Slack branding.

## Suggested first success criteria

The first Slack slice succeeds if:

- a Slack-originated request can enter the system
- missing fields trigger a clarification loop
- a normalized request object is created
- that request becomes visible in TrustPlane
- the ownership and trust posture remain understandable

## What to avoid in v1

Avoid:

- trying to support many workflows at once
- making Slack the primary place for governance decisions
- building a big command surface
- mixing full execution into the first Slack slice

Slack should start as an intake surface, not the full operator control plane.

## Recommended next step after this slice

After this slice works, the next useful upgrade would be:

- show Slack clarification history in the inspection view
- tie the request into one governed approval/execution scenario
- test handoff from Slack intake to operator-owned workflow state

## Summary

The smallest sane Slack integration is:

- one intake bot
- one narrow request family
- one clarification loop
- one normalized request object
- one TrustPlane-visible handoff

That is enough to test whether real chat intake strengthens the product without burying it in connector complexity.
