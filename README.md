# TrustPlane

TrustPlane is a trust-first control-plane prototype for governed AI agents.

It is the sharper direction that emerged from earlier `ai-it-team` exploration.

## What this is

This project is **not**:

- a service desk clone
- a ticketing UI
- a generic observability dashboard

It is an operator-facing surface for a governed agent runtime.

The goal is to show one request moving through an AI-assisted workflow with strong visibility into:

- what is happening right now
- why it is allowed
- what happens next
- where a human can intervene

## Current prototype

The current v0 prototype focuses on one workflow:

- **Grant access to reporting app**

The UI models this system shape:

- request enters system
- orchestrator selects workflow
- intake agent classifies request
- IAM agent takes ownership
- policy check determines whether action is allowed
- governed tool execution is prepared
- human approval is required before execution
- verification confirms outcome
- timeline records everything

## Core UI sections

- **Top request status strip**
  - request title
  - current state
  - current owner
  - risk level
  - autonomy mode

- **Central workflow rail**
  - request submitted
  - intake
  - classification
  - IAM playbook
  - policy check
  - approval check
  - tool execute
  - verification
  - done

- **Decision explanation panel**
  - why the system is at the current stage
  - what evidence was used
  - what rule or policy applies
  - what happens next

- **Timeline panel**
  - readable operational events
  - not raw logs

- **Inspection drawer**
  - raw request JSON
  - raw tool request / response
  - policy metadata
  - playbook version
  - runtime notes

- **Playbook card**
  - trigger
  - preconditions
  - allowed tools
  - approval requirement
  - rollback path

- **Approval bar**
  - mocked approve / deny / pause / resume controls

## Design principle

**The system that decides must also explain.**

That means the runtime surface should make:

- decision path
- policy basis
- execution intent
- human control points

all visible and readable.

## Technical approach

- React
- TypeScript
- Tailwind CSS
- mocked data only
- no backend required yet
- structured so it can later connect to a real runtime

## Run locally

```bash
npm install
npm run dev
```

Open:

- `http://localhost:4511`

Build:

```bash
npm run build
```

## Project structure

- `src/App.tsx` — top-level composition
- `src/mockData.ts` — mocked request, workflow, timeline, policy, and playbook data
- `src/types.ts` — shared types
- `src/components/` — modular UI components

## Why this exists

The larger idea behind TrustPlane is that governed AI systems will need more than intelligence.
They will need a trust and control layer that makes delegation visible, bounded, reviewable, and interruptible.

This prototype is an early UI exploration of that idea.
