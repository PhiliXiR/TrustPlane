# TrustPlane

<img width="940" height="594" alt="TrustplaneLogo" src="https://github.com/user-attachments/assets/18caafa6-0908-4357-9e07-f66f922d3a32" />

TrustPlane is a trust-first control plane for autonomous execution.

TrustPlane is an operator-facing control layer for governed agent work.

It makes intake, routing, approval boundaries, execution, and verification visible so agent-driven work is inspectable instead of magical.

## What works today

- Local React + FastAPI prototype with a working operator-facing UI
- Runtime-backed scenario state with approval, pause, resume, and scenario switching controls
- Streaming execution proof slice for the reporting-access path, including live command output and verification updates
- Generic intake endpoint at `POST /api/intake`
- Intake-created requests can be projected into runtime scenarios
- Lightweight intake-request persistence
- Local `n8n` webhook handoff into TrustPlane is now proven on the Linux machine
- Slack -> intake agent -> watcher -> n8n -> TrustPlane now works end-to-end in the local Linux setup when the backend is bound on `0.0.0.0:8011`

## What is simulated today

- Runtime scenarios are still scenario-backed rather than sourced from a real agent runtime
- Command output is currently simulated to prove the control-plane/event model
- The Slack intake path is implemented in the local Linux setup through the dedicated intake bot + watcher + `n8n` + TrustPlane bridge, but it still needs hardening, tighter automation, and cleaner operational packaging

## What I am building next

- Hardening and operational cleanup for the implemented intake-bot -> watcher -> `n8n` -> TrustPlane path
- Richer trust downgrade / suspended-mode behavior
- Runtime adapters that project real agent/runtime state into the TrustPlane contract
- Cleaner request-native runtime/action/event handling inside TrustPlane itself

## Why this matters

Most AI agent demos show that a model can do something useful.
TrustPlane focuses on the harder problem: how to make agent-driven work legible, governed, interruptible, and reviewable once it starts affecting real systems.

## Demo surface

### Screenshots / demo assets

_Add screenshots or GIFs here._

Recommended captures:

1. **Request overview** — status strip, workflow rail, and current trust boundary
2. **Human checkpoint + execution trace** — where approval or human execution is required
3. **Live command output + inspection** — streamed execution output and raw inspection context

## 5-minute demo path

1. Install deps and start the backend:
   ```bash
   npm install
   npm run backend:install
   npm run backend
   ```
2. In a second terminal, start the frontend:
   ```bash
   npm run dev
   ```
3. Open `http://127.0.0.1:4511`
4. Select **Grant access to reporting app**
5. Click **Approve**
6. Watch the workflow advance, the timeline update, and the **Live Command Output** panel stream execution/verification events
7. Open inspection context to see the raw request, policy metadata, playbook version, and artifact details
8. Compare what is real today versus what is still simulated

## What this is

TrustPlane is a control and visibility layer for AI agents operating inside real systems.

It is centered on:

- execution records
- human oversight and intervention
- execution visibility
- verification and auditability
- human-readable control over agent-driven work
- trust boundaries around autonomous behavior

It is **not**:

- a service desk clone
- a ticketing UI
- a workflow builder
- a generic observability dashboard
- another agent framework

## Core idea

TrustPlane's primary object is the **Execution Record**.

An Execution Record captures:

- intent
- plan
- actions
- outputs
- review
- outcome

In short:

> Intent -> Plan -> Actions -> Outputs -> Review -> Outcome

That structured record is the product.

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
- n8n as a practical local integration substrate, without making workflow runs the core product object

## Current real integration status

As of the current Linux prototype state:

- TrustPlane frontend/backend run locally on Linux
- generic intake endpoint exists at `POST /api/intake`
- intake-created requests can be projected into runtime scenarios
- lightweight intake-request persistence exists
- a separate intake-bot workspace exists outside the repo on the host machine
- a local intake helper can successfully submit canonical intake JSON into TrustPlane
- local `n8n` runs in Docker at `http://127.0.0.1:5678`
- imported `n8n` webhook workflows can now successfully forward normalized payloads into TrustPlane
- Slack is live on the host machine and can reach OpenClaw
- Slack can now be routed to a dedicated intake agent on the host machine
- the local watcher bridge can detect `TRUSTPLANE_INTAKE_PAYLOAD` messages from the intake session store and forward them through `n8n`

So the remaining gap is no longer basic local intake reachability.
The remaining gap is hardening, better operational packaging, and richer runtime-backed projection in the TrustPlane UI.

## Current prototype

TrustPlane currently demonstrates multiple governed runtime scenarios, including:

- **Grant access to reporting app**
- **Change VPN access policy**

The current UI shows:

- request state and trust boundary
- workflow progression and current decision basis
- human checkpoints
- execution trace
- timeline events
- inspection records
- live command output for the streaming proof slice

## How to run it

### Start the backend

```bash
npm install
npm run backend:install
npm run backend
```

The backend startup script now binds uvicorn on `0.0.0.0:8011` so the local Dockerized `n8n` container can reach the intake API through `host.docker.internal`.

Backend:
- `http://127.0.0.1:8011`
- health: `http://127.0.0.1:8011/api/health`
- Docker-reachable intake target for `n8n`: `http://host.docker.internal:8011/api/intake`

### Start the frontend

```bash
npm run dev
```

Frontend:
- `http://127.0.0.1:4511`

### Build

```bash
npm run build
```

## Project structure

- `src/App.tsx` - top-level UI composition
- `src/components/` - UI components
- `src/api.ts` - frontend API calls
- `src/runtime/` - runtime-shaped types and scenario helpers
- `backend/main.py` - FastAPI app
- `backend/models.py` - runtime contract models
- `backend/store.py` - in-memory runtime state and event publishing
- `backend/scenarios.py` - scenario definitions
- `examples/agent-workspaces/` - intake/operator workspace scaffolds
- `examples/intake-fixtures/` - clearly labeled example intake fixtures in machine-readable form
- `ops/n8n/` - starter n8n workflow assets for local intake bridging
- `docs/` - architecture, trust model, intake, deployment, and integration docs

## Key docs

- `docs/index.md` — docs map and suggested reading order
- `docs/product-thesis.md` — what TrustPlane is and is not
- `docs/execution-records-brief.md` — sharper product framing around Execution Records
- `docs/minimum-viable-integration-surface.md` — smallest credible operator-facing contract
- `docs/request-lifecycle-state-model.md` — first-pass governed request lifecycle
- `docs/mvp-build-order.md` — dependency-aware MVP build sequence
- `docs/mvp-api-shape.md` — first practical backend API shape
- `docs/event-taxonomy.md` — stable operator-facing event vocabulary
- `docs/implementation-backlog.md` — concrete implementation queue for the first credible slice
- `docs/current-code-vs-mvp-contract.md` — gap map between current code and the newer MVP contract
- `docs/first-implementation-cut.md` — smallest practical contract-to-code migration pass
- `docs/integration-contract.md` — broader runtime contract direction
- `docs/runtime-adapter-architecture.md` — backend adapter/projection model
- `docs/minimal-operator-team.md` — small deployable operator team
- `docs/trust-rating-model.md` — trust rubric direction
- `docs/live-command-observability.md` — CLI execution visibility model
- `docs/n8n-integration-starter.md` — local n8n webhook-to-TrustPlane starter path
- `docs/intake-agent-tuning-notes.md` — guidance for keeping the intake bot focused
- `docs/intake-submission-examples.md` — canonical example submissions across IT and AWS/ops cases
- `docs/intake-fixture-pack.md` — canonical fully fleshed example fixtures for all 10 curated cases
- `docs/nemoclaw-slack-intake-plan.md` — staged NemoClaw + Slack intake plan
- `docs/first-linux-deployment-instructions.md` — first Linux deployment path

## Relationship to the other projects

- `ai-it-team` is the earlier lab where the workflow/control ideas were explored
- `TrustPlane` is the clearer control-plane direction that emerged from that work
- `AgentJournal` is where the implementation notes, articles, and experiment framing live

Related reading:

- AgentJournal article: **The control plane starts at intake**
- AgentJournal article: **Trust is the real adoption curve in AI-assisted IT operations**

## Why this exists

The underlying problem is not just whether agents can do useful work.
It is whether humans can understand, constrain, review, and intervene in that work once the agent starts interacting with real systems.

TrustPlane is an exploration of that control layer.
