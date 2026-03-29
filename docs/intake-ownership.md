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
