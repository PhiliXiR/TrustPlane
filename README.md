# TrustPlane

<img width="940" height="594" alt="TrustplaneLogo" src="https://github.com/user-attachments/assets/18caafa6-0908-4357-9e07-f66f922d3a32" />

TrustPlane is an operator-facing control plane for governed agent execution.

It makes intake, routing, trust boundaries, approval, execution, verification, and evidence visible so agent-driven work is inspectable instead of magical.

## Core idea

TrustPlane is centered on the **Execution Record**.

An Execution Record captures:

- intent
- plan
- actions
- outputs
- review
- outcome

In short:

> Intent -> Plan -> Actions -> Outputs -> Review -> Outcome

The record itself is the product.

## What TrustPlane is

TrustPlane is a control and visibility layer for agent work operating inside real systems.

It is focused on:

- governed intake
- trust and delegation posture
- human checkpoints and approval boundaries
- execution visibility
- verification and evidence
- operator-readable traceability

It is **not**:

- a ticketing UI
- a workflow builder
- a generic observability dashboard
- another agent framework

## Demo framing

The clearest current demo story is:

1. **Reporting access request** — human-approved governed access change
2. **VPN policy change** — approved operator-agent execution with verification
3. **Slack/OpenClaw/n8n intake path** — believable real intake feeding the same control-plane model

For a recommended show flow and narration, see `docs/demo-runbook.md`.

## What works today

- Local React + FastAPI prototype with an operator-facing UI
- Runtime-backed scenario state with approve, deny, pause, resume, and release controls
- Streaming execution proof slice for the reporting-access path, including live command output and verification updates
- Generic intake endpoint at `POST /api/intake`
- Intake-created requests projected into runtime scenarios
- Lightweight intake-request persistence
- Local `n8n` webhook handoff into TrustPlane proven on the Linux machine
- Local Slack -> intake agent -> watcher -> n8n -> TrustPlane handoff working end-to-end when the backend is reachable at `0.0.0.0:8011`

## What is real today

- request-centric control-plane UI
- intake ingestion into TrustPlane
- request snapshot and timeline projection
- operator controls for approve, deny, pause, resume, and release
- event streaming shape for runtime and request-scoped views
- local Slack -> OpenClaw -> watcher -> n8n -> TrustPlane handoff on the Linux host

## What is simulated today

- runtime scenarios are still scenario-backed rather than sourced from a real agent runtime
- command output is currently simulated to prove the control-plane and event model
- the intake path still needs hardening, tighter automation, and cleaner operational packaging

## Why this matters

Most AI agent demos show that a model can do something useful.
TrustPlane focuses on the harder problem: how to make agent-driven work legible, governed, interruptible, and reviewable once it starts affecting real systems.

Humans need to understand:

- what entered the system
- how it was routed
- what trust boundary applies
- what is prepared or executing
- what was verified afterward
- what evidence remains

That is the layer TrustPlane is trying to make real.

## What I am building next

- hardening and operational cleanup for the intake-bot -> watcher -> `n8n` -> TrustPlane path
- richer trust downgrade and suspended-mode behavior
- runtime adapters that project real agent/runtime state into the TrustPlane contract
- cleaner request-native runtime, action, and event handling inside TrustPlane

## Quick start

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Install backend dependencies

```bash
npm run backend:install
```

### 3. Start the backend

```bash
npm run backend
```

Backend:

- `http://127.0.0.1:8011`
- health: `http://127.0.0.1:8011/api/health`
- Docker-reachable intake target for `n8n`: `http://host.docker.internal:8011/api/intake`

### 4. Start the frontend

In a second terminal:

```bash
npm run dev
```

Frontend:

- `http://127.0.0.1:4511`

### 5. Build

```bash
npm run build
```

## 5-minute demo path

1. Start backend and frontend
2. Open `http://127.0.0.1:4511`
3. Select **Grant access to reporting app**
4. Click **Approve**
5. Watch the workflow advance and the **Live Command Output** panel stream execution and verification events
6. Open inspection context to view request, policy, playbook version, and artifact details
7. Compare what is real today versus what is still simulated

For repeatable demos, use the in-app **Reset demo state** action before presenting. It resets the runtime to the default hero flow and clears persisted intake-created demo records.

## Demo assets

Drop demo screenshots into:

- `docs/assets/demo/`

Recommended captures:

1. `01-request-overview.png`
2. `02-review-gate.png`
3. `03-action-timeline.png`
4. `04-execution-evidence.png`
5. `05-outcome-and-evidence.png`
6. `06-vpn-operator-execution.png`
7. `07-example-mode.png` (optional)
8. `08-demo-reset.png` (optional)

## Project structure

- `src/App.tsx` - top-level UI composition
- `src/components/` - UI components
- `src/api.ts` - frontend API calls
- `src/runtime/` - runtime-shaped types and scenario helpers
- `backend/main.py` - FastAPI app
- `backend/models.py` - runtime contract models
- `backend/store.py` - in-memory runtime state and event publishing
- `backend/scenarios.py` - scenario definitions
- `examples/agent-workspaces/` - intake and operator workspace scaffolds
- `examples/intake-fixtures/` - machine-readable intake fixtures
- `ops/n8n/` - starter n8n workflow assets for local intake bridging
- `docs/` - product, architecture, trust, intake, deployment, and integration docs

## Key docs

Start with:

- `docs/index.md` - docs map and suggested reading order
- `docs/product-thesis.md` - what TrustPlane is and why it exists
- `docs/execution-records-brief.md` - why the Execution Record is the core product object
- `docs/minimum-viable-integration-surface.md` - smallest credible operator-facing contract
- `docs/demo-runbook.md` - recommended demo flow and talking points
- `docs/demo-hardening-checklist.md` - practical checklist for making the current scope showable

## Relationship to the other projects

- `ai-it-team` is the earlier lab where the workflow and control ideas were explored
- `TrustPlane` is the clearer control-plane direction that emerged from that work
- `AgentJournal` is where the implementation notes, articles, and experiment framing live
