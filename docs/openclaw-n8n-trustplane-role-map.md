# OpenClaw vs n8n vs TrustPlane

## Purpose

This document defines the role split between:

- **OpenClaw agents**
- **n8n**
- **TrustPlane**

The goal is to avoid turning the system into a blurry pile of overlapping responsibilities.

If the boundaries stay clean, the architecture is easier to build, easier to explain, and more differentiated.

## Core principle

These three layers should not compete with each other.
They should each own the kind of work they are best suited for.

A useful shorthand:

- **n8n automates**
- **OpenClaw interprets and operates**
- **TrustPlane makes it trustworthy**

## The role of OpenClaw agents

OpenClaw agents are the **adaptive layer**.

They are best used where the system must deal with:

- ambiguity
- messy human requests
- clarification
- routing judgment
- delegated authority
- bounded execution
- conversational interaction
- human-facing explanation

In other words, OpenClaw agents should do the parts where rigid workflows break down.

### Primary OpenClaw agent roles

In the current Linux prototype, the intake agent runs in OpenClaw with Codex handling the conversational intake layer, while `n8n` handles deterministic handoff and TrustPlane remains the operator-facing record and control surface.

#### 1. Intake agent

The intake agent should:

- receive requests from human-facing channels such as Slack
- infer the likely request type
- extract structured fields from messy language
- ask minimal follow-up questions when blocking fields are missing
- emit a canonical normalized intake payload

The intake agent should **not** become a freeform general assistant in the middle of intake.
Its job is to produce a usable intake object with as little conversational churn as possible.

#### 2. Operator agents

Operator agents should:

- act within a specific lane such as access, endpoint, change, or incident
- operate under explicit authority boundaries
- prepare or execute bounded actions
- explain what they are doing and why
- pause for human approval when risk, policy, or confidence requires it

These agents are not generic workers.
They are role-shaped agents operating inside a governed environment.

#### 3. Human-facing explanation agents

OpenClaw agents can also serve as the human-facing explanation layer.

They can explain:

- what the system thinks the request means
- what route was chosen
- why a request is blocked
- why approval is required
- what happened during execution
- what evidence exists afterward

This explanatory function is part of the trust layer, not just a user-experience nicety.

## The role of n8n

n8n is the **deterministic integration layer**.

It is best used for:

- API glue
- workflow routing that is explicit and static
- notifications
- webhooks
- deterministic branching
- scheduled jobs
- enrichment steps
- fan-out to external systems
- retries and transport-level reliability

n8n should not become the place where the system's core ontology lives.

An n8n workflow run is not the product's primary object.
It is one possible substrate for moving data and triggering actions.

### Good n8n jobs in this architecture

- receive a canonical intake payload from an intake agent or helper
- validate the payload shape
- stamp metadata like received time or correlation id
- forward the payload into TrustPlane
- trigger downstream notifications
- branch into deterministic enrichment or integration paths

### Bad n8n jobs in this architecture

- owning the canonical definition of a request
- replacing the intake agent's interpretation role
- becoming the main user-facing control surface
- being treated as the authoritative execution record

## The role of TrustPlane

TrustPlane is the **trust layer** and **system of record for governed autonomous work**.

It is responsible for:

- Execution Records
- visibility
- replay
- review
- approval
- intervention
- operator understanding
- trust boundaries
- verification status
- auditability

TrustPlane should be the place where humans go to understand:

- what the system believed it was doing
- what plan it selected
- what happened next
- what actions were taken
- where human checkpoints occurred
- what the final outcome was

## Where Execution Records begin

This is an important product boundary.

### Recommended rule

The Execution Record begins **as soon as the system has a meaningful normalized statement of requested work**.

That means the record should begin **during or immediately after governed intake**, not only once execution starts.

If the system waits until later, too much of the important trust context is lost.

### Why this matters

The earliest moments are where the system determines:

- what the user meant
- which route seems appropriate
- what information is missing
- what trust mode should apply
- whether clarification is still needed

That is already part of the governed process.
It belongs in the record.

## Intake object vs Execution Record

These are related, but not identical.

### Intake object

The intake object is the normalized statement of the request.

It typically contains:

- source
- requester
- raw request
- normalized type
- target system
- requested entitlement or action
- business reason
- clarification state
- missing fields
- candidate workflows
- initial trust mode

### Execution Record

The Execution Record contains the intake object **plus the governed lifecycle that follows**.

That includes:

- intent
- plan
- actions
- outputs
- review
- outcome

The intake object is the beginning of the record, not a separate world.

## Recommended handoff path

### Preferred path

```text
Slack / external channel
  -> OpenClaw intake agent
  -> canonical normalized payload
  -> n8n webhook
  -> TrustPlane /api/intake
  -> Execution Record / runtime view
```

### Why this split is good

- OpenClaw handles ambiguity and human interaction
- n8n handles deterministic transport and integration logic
- TrustPlane owns the record, visibility, and governance surface

This makes the architecture easier to reason about and easier to explain.

## Submission rule for intake agents

The intake agent should submit the payload once the request is **meaningful enough to track**, even if some fields are still missing.

### Submit when

- request type is likely known
- target system is likely known
- requester is known or inferable
- the raw request is captured
- there is enough intent to create a meaningful record

### If information is still missing

The intake agent should:

- set `clarificationNeeded: true`
- populate `missingFields`
- submit anyway if the request is already meaningful enough to track

This prevents the system from getting stuck in endless intake chatter.

## What should never happen outside TrustPlane

If a detail matters for operator trust, review, or intervention, it should not remain trapped in private chat or hidden runtime state.

That means the following should be represented inside the Execution Record or its supporting model:

- normalized request meaning
- selected route or lane
- trust mode
- approval requirement
- prepared action intent
- execution state transitions
- verification status
- human approvals, denials, pauses, and takeovers
- outcome summary

If these things happen outside the record, the product loses its core differentiator.

## What can stay outside TrustPlane

Not every internal runtime detail needs to be surfaced.

Examples that can remain internal unless they affect operator trust:

- hidden chain-of-thought
- low-level retry mechanics
- internal scheduling details
- raw prompt internals that do not affect operator trust or review
- transport noise that does not affect operator understanding

Prompt-path observability can still matter. In practice, tooling such as Langfuse is useful for tracing prompt inputs, normalization behavior, and clarification drift without turning prompt telemetry into the product surface itself.

The rule is simple:

- if it affects trust, visibility, or intervention, bring it into the record
- if it does not, it can stay internal

## Strategic implication

The point of this architecture is not to make OpenClaw or n8n the product.

The point is to make TrustPlane the thing that organizations trust.

That only works if:

- OpenClaw agents are used where adaptation and judgment matter
- n8n is used where deterministic integration matters
- TrustPlane remains the place where the full governed story becomes legible

## Short version

- **OpenClaw agents** handle interpretation, clarification, delegated action, and explanation
- **n8n** handles transport, glue, routing, and deterministic workflow mechanics
- **TrustPlane** owns the Execution Record, review surface, and trust boundary model

That is the clean split.
