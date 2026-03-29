# TrustPlane

TrustPlane is a trust-first control-plane prototype for governed AI agents.

It is the sharper direction that emerged from earlier `ai-it-team` exploration.

The current direction includes a more realistic deployment shape built around:

- governed intake bots
- a very small deployable operator team
- example agent workspaces and runtime config shape
- backend runtime adapters and projection layers
- operator-visible trust, approval, execution, and verification boundaries
- a future rubric-based trust rating model tied to real delegation and execution posture

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

TrustPlane currently demonstrates multiple governed runtime scenarios, including:

- **Grant access to reporting app**
- **Change VPN access policy**

The UI models this system shape:

- request enters system
- orchestrator selects workflow
- intake agent classifies request
- domain agent takes ownership
- policy check determines whether action is allowed
- governed tool execution is prepared
- human approval or human execution may be required
- verification confirms outcome
- timeline records everything

## Core UI sections

- **Top request status strip**
  - request title
  - current state
  - current owner
  - risk level
  - autonomy mode
  - trust boundary summary

- **Scenario selector**
  - swaps between governed runtime patterns while preserving the same control-plane surface

- **Central workflow rail**
  - request submitted
  - intake
  - classification
  - playbook selection
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

- **Human checkpoints panel**
  - where human review, approval, or execution is required

- **Execution trace panel**
  - concrete action path separate from workflow movement

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
  - approve / deny / pause / resume controls that now mutate runtime-backed local state through the backend

## Design principle

**The system that decides must also explain.**

That means the runtime surface should make:

- decision path
- policy basis
- execution intent
- human control points
- trust boundaries

all visible and readable.

## Technical approach

### Frontend

- React
- TypeScript
- Tailwind CSS

### Backend

- FastAPI
- Python runtime snapshots and action endpoints

### Current backend role

The backend currently serves:

- runtime snapshot
- scenario switching
- approve / deny / pause / resume actions

The frontend now consumes the FastAPI backend rather than reading static mock state directly.

## Run locally

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Create a Python virtual environment

```bash
python -m venv .venv
```

### 3. Install backend dependencies

```bash
npm run backend:install
```

### 4. Start the FastAPI backend

```bash
npm run backend
```

Backend runs at:

- `http://127.0.0.1:8011`

Health check:

- `http://127.0.0.1:8011/api/health`

### 5. Start the frontend in a second terminal

```bash
npm run dev
```

Frontend runs at:

- `http://localhost:4511`

## Build

```bash
npm run build
```

## Project structure

- `src/App.tsx` — top-level composition
- `src/components/` — modular UI components
- `src/api.ts` — frontend calls into the backend
- `src/runtime/` — scenario definitions and runtime-shaped types
- `backend/main.py` — FastAPI app
- `backend/models.py` — runtime contract models
- `backend/store.py` — in-memory runtime state mutations
- `backend/scenarios.py` — backend scenario definitions
- `docs/` — product thesis, roadmap, integration contract, reuse note, backend plan

## Why this exists

The larger idea behind TrustPlane is that governed AI systems will need more than intelligence.
They will need a trust and control layer that makes delegation visible, bounded, reviewable, interruptible, and revocable.

TrustPlane is an early product and architecture exploration of that idea.
