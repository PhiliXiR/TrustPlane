# TrustPlane

TrustPlane is a trust-first control-plane prototype for governed AI agents.

It is the sharper direction that emerged from earlier `ai-it-team` exploration.

## What this is

TrustPlane is an operator-facing surface for a governed agent runtime.

The project is centered on:

- governed intake
- trust and delegation posture
- approval and intervention boundaries
- execution visibility
- verification and auditability
- human-readable control over agent-driven work

It is **not**:

- a service desk clone
- a ticketing UI
- a generic observability dashboard
- another agent framework

## Current direction

TrustPlane is moving toward a more realistic deployment shape built around:

- governed intake bots
- a very small deployable operator team
- example agent workspaces and runtime config shape
- backend runtime adapters and projection layers
- operator-visible trust, approval, execution, and verification boundaries
- a rubric-based trust rating model tied to delegation and execution posture
- live command observability for operator CLI work
- a real local intake-to-dashboard handoff path
- a staged plan for using Slack as the real intake surface
- an explicit delegation and routing model for operator handoff
- a Linux-first deployment shape for the real runtime-backed version

## Current real integration status

As of the current Linux prototype state:

- TrustPlane frontend/backend run locally on Linux
- generic intake endpoint exists at `POST /api/intake`
- intake-created requests can be projected into runtime scenarios
- lightweight intake-request persistence exists
- a separate intake-bot workspace exists outside the repo on the host machine
- a local intake helper can successfully submit canonical intake JSON into TrustPlane
- Slack is live on the host machine and can reach OpenClaw
- Slack currently routes to the default/main agent, not yet the dedicated intake agent

So the remaining gap is not whether intake can reach the dashboard.
The remaining gap is automatic Slack -> intake-agent routing and automatic intake-agent submission.

## Current prototype

TrustPlane currently demonstrates multiple governed runtime scenarios, including:

- **Grant access to reporting app**
- **Change VPN access policy**

The UI models this system shape:

- request enters system
- intake and classification shape the request
- a domain operator or workflow takes ownership
- policy determines what is allowed
- governed execution is prepared or performed
- human approval or human execution may be required
- verification confirms outcome
- timeline and inspection surfaces explain what happened

A new streaming proof slice also exists for the reporting-access path, allowing the UI to show simulated command execution progress and verification updates over time.

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

- **Live command output panel**
  - streamed command/execution output for the current proof slice

- **Timeline panel**
  - readable operational events
  - not raw logs only

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
  - approve / deny / pause / resume controls that mutate runtime-backed local state through the backend

## Design principle

**The system that decides must also explain.**

That means the runtime surface should make visible:

- decision path
- policy basis
- execution intent
- human control points
- trust boundaries
- verification status

## Technical approach

### Frontend

- React
- TypeScript
- Tailwind CSS

### Backend

- FastAPI
- Python runtime snapshots and action endpoints
- SSE-based event streaming for the current execution proof slice

### Current backend role

The backend currently serves:

- runtime snapshot
- scenario switching
- approve / deny / pause / resume actions
- event streaming for simulated command execution updates

The frontend consumes the FastAPI backend rather than reading static mock state directly.

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

On Linux/macOS:

```bash
npm run backend:install
```

On Windows:

```bash
npm run backend:install:windows
```

### 4. Start the FastAPI backend

On Linux/macOS:

```bash
npm run backend
```

On Windows:

```bash
npm run backend:windows
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

- `src/App.tsx` - top-level composition
- `src/components/` - modular UI components
- `src/api.ts` - frontend calls into the backend
- `src/runtime/` - scenario definitions and runtime-shaped types
- `backend/main.py` - FastAPI app
- `backend/models.py` - runtime contract models
- `backend/store.py` - in-memory runtime state mutations and event publishing
- `backend/scenarios.py` - backend scenario definitions
- `examples/agent-workspaces/` - intake/operator workspace scaffolds
- `docs/` - architecture, trust model, intake, operator, deployment, and integration docs

## Key docs

- `docs/index.md` — docs map and suggested reading order
- `docs/product-thesis.md` — core product idea
- `docs/integration-contract.md` — runtime contract direction
- `docs/runtime-adapter-architecture.md` — backend adapter/projection model
- `docs/minimal-operator-team.md` — small deployable operator team
- `docs/trust-rating-model.md` — trust rubric direction
- `docs/live-command-observability.md` — CLI execution visibility model
- `docs/nemoclaw-slack-intake-plan.md` — staged NemoClaw + Slack intake plan
- `docs/first-linux-deployment-instructions.md` — first Linux deployment path

## Why this exists

The larger idea behind TrustPlane is that governed AI systems will need more than intelligence.
They will need a trust and control layer that makes delegation visible, bounded, reviewable, interruptible, and revocable.

TrustPlane is an early product and architecture exploration of that idea.
