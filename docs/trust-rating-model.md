# Trust Rating Model

## Purpose

This document defines a future trust rating model for TrustPlane.

The goal is to make trust visible and operationally meaningful without drifting into fake precision.

## Core principle

TrustPlane should not use an opaque or overly precise trust score.

It should use:

- coarse trust tiers
- visible rating criteria
- explicit grant conditions
- explicit downgrade triggers
- direct linkage to delegation and execution modes

## What trust means here

Trust in TrustPlane is not just trust in a model.

It is trust in a governed operational path, including:

- workflow maturity
- playbook quality
- rollback reliability
- verification strength
- blast radius
- policy clarity
- exception frequency
- human intervention history

That means trust is about the whole workflow slice, not just AI confidence.

## Recommended model shape

### 1. Trust tier

TrustPlane should expose a small number of visible trust levels.

Example set:

- **Untrusted**
- **Observed**
- **Bounded**
- **Elevated**
- **Restricted**

These are coarse enough to stay understandable.

## Suggested meanings

### Untrusted

The workflow is not yet considered safe for delegated execution.

Typical conditions:

- immature workflow
- weak or absent verification
- unclear rollback
- high ambiguity
- recent failures or drift

Typical posture:

- suggest only
- human-owned execution
- frequent clarification or intervention

### Observed

The workflow can be prepared and observed, but still needs strong human control.

Typical conditions:

- known workflow pattern
- some verification exists
- limited operating history
- moderate ambiguity still possible

Typical posture:

- human review required
- execution not delegated
- runtime may prepare but not act

### Bounded

The workflow is stable enough for constrained delegation within clear boundaries.

Typical conditions:

- stable playbook
- moderate or strong verification
- clear rollback path
- low or moderate blast radius
- acceptable operating history

Typical posture:

- human-approved execution
- bounded automated steps
- visible downgrade triggers

### Elevated

The workflow has strong evidence, strong controls, and a strong operational history.

Typical conditions:

- mature workflow
- strong verification
- reliable rollback
- low exception frequency
- low ambiguity

Typical posture:

- conditional autonomous execution may be allowed
- audit and verification remain mandatory
- trust remains revocable

### Restricted

Trust has been reduced or suspended due to conditions that make delegation unsafe.

Typical conditions:

- verification failure
- rollback failure
- repeated exceptions
- policy drift
- increased blast radius
- operator intervention pattern indicating instability

Typical posture:

- human-only path
- automation blocked or suspended
- explicit remediation required before trust is restored

## 2. Trust factors

TrustPlane should rate trust using visible factors rather than one hidden score.

## Suggested factor set

### Workflow maturity

How well understood and stable the workflow is.

Values might include:

- experimental
- draft
- stable
- proven

### Playbook maturity

How versioned, repeatable, and constrained the operational path is.

Values might include:

- ad hoc
- partial
- versioned
- proven

### Verification strength

How strongly the system can confirm the outcome.

Values might include:

- none
- weak
- moderate
- strong

### Rollback reliability

How reliable the recovery path is if something goes wrong.

Values might include:

- none
- uncertain
- partial
- reliable

### Blast radius

How serious the impact would be if execution went wrong.

Values might include:

- low
- medium
- high

### Policy clarity

How clear and deterministic the governing policy is.

Values might include:

- unclear
- partial
- clear

### Exception frequency

How often the workflow requires unusual handling.

Values might include:

- high
- moderate
- low

### Human intervention rate

How often humans have to correct, stop, or take over the workflow.

Values might include:

- high
- moderate
- low

## 3. Grant conditions

Trust elevation should happen only when visible conditions are met.

Examples:

- workflow has completed successfully multiple times
- verification is consistently strong
- rollback has been tested or proven
- exception rate remains low
- policy basis is stable and explicit

This should be shown as a human-readable basis, not hidden math.

## 4. Downgrade triggers

Trust must be revocable.

Examples:

- verification failure
- rollback failure
- repeated operator takeover
- policy drift detected
- workflow exception spike
- trust boundary violation
- unexplained execution mismatch

Downgrade triggers should be visible in the UI.

## 5. Resulting control posture

Trust is only useful if it changes what the system is allowed to do.

Trust tier should directly affect:

- delegation mode
- execution mode
- approval requirement
- whether automation is blocked
- whether execution must return to a human-only path

## Preferred presentation

TrustPlane should prefer output like this:

- **Trust Level:** Bounded
- **Delegation Mode:** Human-approved execution
- **Execution Mode:** Prepared only
- **Why:** Stable playbook, moderate blast radius, strong verification, partial rollback reliability
- **Downgrade Triggers:** verification failure, repeated exception handling, policy drift

This is better than a fake numeric score.

## What to avoid

Avoid:

- hidden trust math
- scores like 73.4 or 82.1
- confidence language without operational meaning
- model-confidence-only trust framing
- trust labels that do not affect control behavior

## Relationship to existing TrustPlane taxonomy

This model should complement, not replace:

- trust level
- delegation mode
- execution mode

The trust rating model helps explain how trust level is determined and when it changes.

## Example progression

A workflow might progress like this:

1. **Observed**
   - workflow is known but still heavily supervised
2. **Bounded**
   - workflow gains stable playbook and strong verification
3. **Elevated**
   - workflow becomes reliable enough for conditional autonomous execution
4. **Restricted**
   - verification failure or drift causes trust downgrade

That progression reinforces the idea that trust is earned and revocable.

## Summary

TrustPlane should eventually use a rubric-based trust rating model built from:

- coarse trust tiers
- visible trust factors
- explicit grant conditions
- explicit downgrade triggers
- direct linkage to delegation and execution posture

That keeps trust understandable, governable, and operator-facing.
