# Delegation Taxonomy

## Purpose

This document defines the current TrustPlane delegation model in clearer language.

The goal is to avoid fuzzy or overly clever labels and make the trust/delegation model easier to understand, explain, and eventually connect to runtime behavior.

## Why this exists

A trust-first control plane needs a visible model of how much authority the runtime currently has.

At first, it was tempting to use numeric labels like:

- Level 1
- Level 1.5
- Level 2

That worked as a rough shorthand, but it is not ideal.

It implies more precision than currently exists and makes the product harder to read.

TrustPlane is clearer when it distinguishes between:

- **trust level**
- **delegation mode**
- **execution mode**

## Recommended structure

### 1. Trust level

Trust level is a coarse summary of how much operational authority the runtime has earned in the current workflow.

Suggested values:

- **Low**
- **Moderate**
- **Elevated**
- **Restricted**

This is not a score.
It is an operator-facing summary.

### 2. Delegation mode

Delegation mode is the more important field.
It tells the operator what the runtime is currently allowed to do.

Suggested modes:

- **Observe only**
- **Suggest only**
- **Human-approved execution**
- **Human-executed change**
- **Bounded autonomous execution**
- **Suspended / downgraded**

This is the core control-plane vocabulary.

### 3. Execution mode

Execution mode clarifies who actually performs the action.

Suggested values:

- **Runtime executed**
- **Human executed**
- **Execution blocked**
- **Prepared only**

This matters because approval and execution are not the same thing.

## Why this model is better

This structure is better than fractional levels because it makes three things explicit:

### A. Trust is not just a number

A runtime may be moderately trusted but still not allowed to execute directly.

### B. Delegation and execution are different

A workflow can be approved but still require human execution.

### C. Trust should be revocable

The system should be able to move into a suspended or downgraded state when verification fails, policy changes, or operators lose confidence.

## Current scenario mapping

### Scenario: Grant access to reporting app

- **Trust level:** Moderate
- **Delegation mode:** Human-approved execution
- **Execution mode:** Prepared only

Meaning:

- the runtime can interpret and prepare the action
- a human must approve before execution
- once approved, the runtime may execute inside governed bounds

### Scenario: Change VPN access policy

- **Trust level:** Moderate
- **Delegation mode:** Human-executed change
- **Execution mode:** Human executed

Meaning:

- the runtime can stage and explain the change
- a human must still execute the final risky action
- the runtime supports preparation, verification, and evidence, but not final execution authority

## Later evolution

Over time, TrustPlane may support richer logic around trust transitions, such as:

- moving from Suggest only -> Human-approved execution
- moving from Human-approved execution -> Bounded autonomous execution
- moving from any mode -> Suspended / downgraded after failed verification or human override

But that can come later.

For now, the important thing is to keep the language clear.

## Recommended UI language

Where possible, TrustPlane should prefer labels like:

- **Trust level: Moderate**
- **Delegation mode: Human-approved execution**
- **Execution mode: Prepared only**

That is clearer than labels like:

- Level 1.5

## Summary

TrustPlane should not treat trust as a fake-precise score.

It should treat trust as an operator-facing model made up of:

- a coarse trust level
- a delegation mode
- an execution mode

That is the most useful current taxonomy.
