# Delegation and Routing Model

## Purpose

This document explains who should delegate work to operators in the TrustPlane model and how that delegation should work.

The goal is to make routing and ownership explicit instead of leaving them implied.

## Core principle

OpenClaw should not be the final delegator.
TrustPlane UI should not be the hidden delegation engine.

The most sensible model is:

- OpenClaw handles intake conversation and normalization
- a request router performs delegation
- TrustPlane shows and governs the resulting ownership, trust, and control state

## Roles in the delegation chain

### OpenClaw

OpenClaw should own:

- intake conversation
- clarification loop
- request normalization
- request packaging for handoff

OpenClaw may suggest likely workflows or operator lanes, but it should not be the final source of delegation authority.

### Request router

The request router should own:

- checking whether the normalized request is complete enough to proceed
- workflow family selection
- initial owner selection
- operator lane assignment
- delegation constrained by policy and trust posture

This is the concrete component that decides where work should go next.
In early versions, it may be a simple backend routing table plus policy checks rather than a complex orchestration system.

### TrustPlane

TrustPlane should own:

- visibility into delegation decisions
- visibility into current owner
- visibility into trust posture and policy basis
- operator-facing intervention controls
- explanation of why a request was delegated the way it was

TrustPlane should not have to be the hidden system that makes all routing decisions itself.

## Basic delegation flow

### Step 1 — intake

A user sends a request to OpenClaw in Slack or another intake surface.

### Step 2 — normalization

OpenClaw clarifies missing fields and produces a normalized request object.

### Step 3 — routing

The request router checks:

- whether the normalized request is complete enough to proceed
- normalized request type
- required workflow family
- trust/delegation posture
- policy constraints
- exception conditions

### Step 4 — delegation

The request router assigns:

- current owner
- workflow candidate
- delegation mode
- execution mode

### Step 5 — TrustPlane projection

TrustPlane shows:

- who owns the request
- why that lane was selected
- what trust boundary applies
- what happens next

## Example operator routing

Examples:

- `access_request` -> `access-operator`
- `endpoint_support` -> `endpoint-operator`
- `infrastructure_change` -> `change-operator`

That mapping may begin as a simple routing table and become more sophisticated later.

## Why OpenClaw should not be the final delegator

If OpenClaw both converses with the user and performs final delegation, too much authority gets concentrated in the intake agent.

That creates problems:

- harder to constrain
- harder to audit
- harder to override
- easier to blur user conversation with execution authority

It is better for OpenClaw to shape requests than to own downstream control decisions.

## Why TrustPlane should not be the hidden delegator

TrustPlane should explain and expose delegation.
It should not quietly become an invisible routing engine with no separation from the control surface.

If TrustPlane does perform routing in early versions, it should do so explicitly as part of a backend routing component rather than as an implicit UI behavior.

## Early implementation reality

In the first prototype versions, the TrustPlane backend may temporarily contain the routing logic.

That is acceptable as long as the boundary is conceptually clear:

- backend routing component decides
- UI shows the decision

This is still better than blending delegation into the chat bot or burying it in the frontend.

## Delegation modes

Not every request should be delegated the same way.

Possible delegation outcomes:

### 1. Automatic delegation

Use when:

- workflow is clear
- request is complete
- mapping is stable
- trust posture supports automated lane selection

### 2. Suggested delegation

Use when:

- likely lane is clear but confidence is not perfect
- request has mild ambiguity
- an operator may want to confirm routing

### 3. Human-confirmed delegation

Use when:

- request is ambiguous
- multiple operator lanes are plausible
- trust posture is weak
- exception handling is involved

This keeps routing itself under governance when needed.

## Inputs that should affect routing

Routing should consider:

- normalized request type
- target system
- requested action
- ambiguity state
- missing fields
- candidate workflows
- trust posture
- policy restrictions
- blast radius or risk class

## What TrustPlane should display about routing

TrustPlane should make routing visible by showing:

- current owner
- selected operator lane
- delegation mode
- execution mode
- trust level
- routing reason
- fallback or escalation path

This helps the operator understand whether the delegation makes sense and whether intervention is needed.

## Example end-to-end flow

### Example: reporting access request

1. User in Slack asks for reporting access
2. OpenClaw asks for missing environment or justification
3. OpenClaw normalizes the request
4. Routing layer evaluates `normalizedType = access_request`
5. Routing layer assigns `access-operator`
6. TrustPlane displays:
   - current owner = Access Operator
   - workflow candidate = access_request_standard
   - delegation mode = human-approved execution
   - trust level = Bounded

## Summary

The cleanest model is:

- OpenClaw prepares the request
- routing/orchestration delegates the request
- TrustPlane shows and governs the handoff

That keeps intake, delegation, and operator control as related but distinct responsibilities.
