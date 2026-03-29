# What to Reuse from ai-it-team

## Purpose

This note captures what TrustPlane should inherit from `ai-it-team` and what it should deliberately leave behind.

The goal is to preserve the strongest learning without dragging over the broader exploratory sprawl.

## Reuse

### Conceptual primitives

- request
- workflow stage
- current owner
- approval / human checkpoint
- trace / timeline
- artifact
- execution step
- verification
- trust boundary
- next-step clarity

### UI lessons

- current-focus / hero-first hierarchy
- workflow as the primary structure
- inspection as secondary
- human-readable first, raw data second
- explanation panel linked to workflow state
- playback / step-through thinking

### Control-plane ideas

- explicit approval boundaries
- requester clarification loops
- human takeover moments
- human execution of risky steps
- separation of workflow / authority / execution / verification / evidence
- stronger trace vocabulary

## Leave behind

### Broad scope and simulation sprawl

TrustPlane should avoid inheriting:

- large org-chart simulation
- broad multi-workflow sprawl
- topology-heavy presentation as the main event
- generic “AI-for-IT sandbox” framing
- service-desk-adjacent clutter

## Why

`ai-it-team` was useful for exploring the landscape.
TrustPlane is useful because it is sharper.

The project is stronger when it stays centered on:

- trust boundaries
- governed execution
- operator visibility
- human-supervised delegation

## Short version

TrustPlane should inherit the best runtime concepts from `ai-it-team`, but not the broader exploratory shape.

That means:

- keep the control logic
- keep the trust vocabulary
- keep the execution/verification distinction
- drop the broader simulation surface
