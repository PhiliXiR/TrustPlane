# Runtime Adapter Architecture

## Purpose

This document describes how TrustPlane should fit into a larger governed agent system.

The goal is to make the architecture explicit before deeper integration work begins.

## Core principle

TrustPlane should not become the agent runtime itself.

It should become the operator-facing trust and control plane that sits around the runtime and exposes:

- what is happening
- why it is allowed
- what is blocked
- what happens next
- where a human can intervene
- what evidence exists

## High-level architecture

### 1. External intake surfaces

Examples:

- Slack
- Jira
- email parser
- portal form
- chat UI

These surfaces collect or forward incoming requests.

They do **not** need to contain the full governance logic.

### 2. Governed intake layer

This layer should normalize raw requests into governed runtime objects.

Responsibilities:

- parse request intent
- normalize request fields
- detect ambiguity
- request clarification when needed
- determine candidate workflows
- assign initial risk and delegation posture

TrustPlane should conceptually own this layer, even if some external intake UIs live elsewhere.

### 3. Agent/runtime layer

Examples:

- NemoClaw
- OpenShell
- other agent runtimes

Responsibilities:

- agent execution
- workflow progression
- tool invocation
- session orchestration
- sandboxing
- low-level execution permissions

This is where the actual runtime work happens.

### 4. Runtime adapter / projection layer

This is the most important backend concept for TrustPlane.

The backend should sit here.

Responsibilities:

- read runtime state
- subscribe to runtime events
- normalize event vocabulary
- build request-centric snapshots
- expose operator-safe APIs
- accept operator actions and translate them back into runtime actions

This is the bridge between runtime internals and the operator UI.

### 5. TrustPlane UI

Responsibilities:

- render request-centric state
- show workflow progression
- show trust boundaries
- show human checkpoints
- show execution trace
- show policy basis
- show verification and artifacts
- expose bounded operator actions

## Recommended flow

### Intake flow

1. Request arrives from Slack, Jira, or another external surface
2. Governed intake layer normalizes the request
3. Runtime receives a structured request object
4. Runtime selects workflow / playbook / owner
5. Adapter projects the current state into TrustPlane objects
6. UI renders the request and trust posture

### Execution flow

1. Runtime prepares a tool action
2. Adapter exposes that as a TrustPlane execution envelope
3. UI shows what is prepared and why it is or is not allowed
4. Human approves, denies, pauses, or resumes if needed
5. Backend translates that action to the runtime
6. Runtime executes or remains blocked
7. Adapter receives execution result and verification state
8. UI updates timeline, execution trace, and trust state

## Why the adapter layer matters

Without an adapter layer, the UI would have to consume raw runtime internals directly.
That is usually a bad idea.

The adapter layer exists to:

- keep the UI stable even if runtime internals change
- expose only operator-relevant information
- map low-level runtime events into a human-readable contract
- keep governance and trust concepts consistent across runtimes

## What the backend should do

The backend should act as:

### 1. Projection layer

Convert runtime state into TrustPlane snapshots.

Examples:

- current request state
- workflow state
- trust model
- pending tool action
- verification state
- artifact summary

### 2. Translation layer

Map runtime internals into TrustPlane vocabulary.

Examples:

- runtime internal permission object -> policy decision object
- tool call ready -> execution.change.prepared
- policy hold -> human.approval.requested
- runtime state drift -> verification.check.failed

### 3. Control gateway

Accept UI actions and translate them into runtime-side actions.

Examples:

- approve
- deny
- pause
- resume
- request clarification
- force human takeover
- downgrade autonomy

## What the backend should not do

TrustPlane backend should avoid becoming:

- the main agent runtime
- a giant workflow engine
- a hidden execution brain that bypasses the real runtime
- a second competing orchestration layer

Its purpose is not to replace the runtime.
Its purpose is to make the runtime governable and legible.

## Example architecture diagram in words

### Raw request path

Slack / Jira / Portal
-> Governed intake layer
-> Agent runtime
-> Runtime adapter / projection backend
-> TrustPlane UI

### Operator action path

TrustPlane UI
-> Runtime adapter / projection backend
-> Agent runtime
-> Tool / execution system
-> Runtime adapter / projection backend
-> TrustPlane UI

## Example backend modules

As the backend grows, a useful structure might be:

### Connectors

- `connectors/nemoclaw.py`
- `connectors/openshell.py`
- `connectors/slack.py`
- `connectors/jira.py`

### Intake

- `intake/parser.py`
- `intake/normalizer.py`
- `intake/clarification.py`

### Projectors

- `projectors/requests.py`
- `projectors/timeline.py`
- `projectors/trust.py`
- `projectors/execution.py`

### Actions

- `actions/approve.py`
- `actions/deny.py`
- `actions/pause.py`
- `actions/resume.py`
- `actions/takeover.py`

### API

- `api/runtime.py`
- `api/scenarios.py`
- `api/events.py`

This is not a required structure yet, but it points in a sane direction.

## Long-term architectural thesis

The runtime owns execution.
TrustPlane backend owns normalization, projection, translation, and operator mediation.
TrustPlane UI owns visibility, explanation, and bounded control.

That split keeps the system clean.

## Summary

TrustPlane should tie into AI tools and agent runtimes through a backend adapter layer that:

- normalizes intake
- projects runtime state
- translates event vocabulary
- mediates operator actions
- preserves a stable operator-facing contract

That is the architecture most aligned with the real TrustPlane vision.
