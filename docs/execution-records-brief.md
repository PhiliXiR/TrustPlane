# TrustPlane — Execution Records Brief

## Core idea

TrustPlane is a control and visibility layer for AI agents operating inside real systems.

Its job is to make autonomous systems observable, reviewable, and trustworthy.

## The key shift

TrustPlane is **not** fundamentally a ticketing system.
It is **not** a workflow builder.

The product centers on one core object:

## Execution Record

An Execution Record is the structured account of what an agent was trying to do, what it planned, what it actually did, what happened, where humans intervened, and how the outcome was verified.

Canonical shape:

- **Intent** — what the agent or operator was trying to accomplish
- **Plan** — the proposed or inferred path of execution
- **Actions** — tool calls, commands, messages, API operations, and other concrete steps
- **Outputs** — artifacts, logs, responses, created resources, and state changes
- **Review** — human approvals, denials, pauses, edits, and annotations
- **Outcome** — final status, verification result, and completion summary

In short:

> Intent -> Plan -> Actions -> Outputs -> Review -> Outcome

That structured record is the product.

## Relationship to execution tools

Execution tools like n8n, OpenClaw, scripts, or custom runtimes can perform the actual work.

TrustPlane sits above that layer.

TrustPlane does not replace execution engines.
It governs them by:

- observing what happened
- capturing it in a structured record
- enabling human oversight
- preserving auditability
- making intent and outcomes legible

## Product experience

The experience should feel closer to:

- a timeline
- a trace
- a replayable log

Not a dashboard-first queue.
Not a service desk.
Not a generic workflow editor.

## Why it matters

There are many tools to build agents and many tools to run automation.
There are far fewer tools that help organizations answer:

- What did the agent actually do?
- Why did it do it?
- Under what authority or policy?
- Where did a human review or intervene?
- What changed in the real system?
- Was the final outcome verified?

That gap is where TrustPlane sits.

## Strategic position

TrustPlane can be understood as:

- the control plane for autonomous execution
- the trust layer organizations need before they fully rely on automation
- a tool-agnostic oversight surface for agent activity across runtimes

## Product principles

- The primary object is the **Execution Record**.
- Human oversight belongs **inside** the record, not beside it.
- Intent is as important as the action log.
- Verification matters as much as execution.
- The system should explain not just **what** happened, but **why**.
- TrustPlane should make AI execution legible.

## Immediate implications for v0

A useful v0 should make it easy to:

- ingest execution events from one or more runtimes
- assemble them into coherent Execution Records
- inspect records step-by-step
- expose approvals and interventions as first-class record events
- show artifacts and outputs alongside the step history
- support replay-oriented reading of the record

## Relationship to the MVP docs

The newer MVP docs turn this framing into a first practical build shape.

Use these alongside this brief:

- `minimum-viable-integration-surface.md` for the first stable object contract
- `request-lifecycle-state-model.md` for the first governed request progression
- `event-taxonomy.md` for the first stable event vocabulary
- `mvp-api-shape.md` for the first practical backend surface

## Open questions

- What is the canonical schema for an Execution Record?
- What intervention types are first-class in the model?
- What granularity should be stored: run, step, tool call, artifact, approval?
- What verification model is required for a record to be considered trustworthy?
- Which first user matters most: solo builder, operator team, platform team, or enterprise governance owner?
