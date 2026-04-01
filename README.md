# TrustPlane

<img width="940" height="594" alt="TrustplaneLogo" src="https://github.com/user-attachments/assets/18caafa6-0908-4357-9e07-f66f922d3a32" />

TrustPlane is an operator-facing control layer for governed agent work.

It makes intake, routing, approval boundaries, execution, and verification visible so agent-driven work is inspectable instead of magical.

## What works today

- Local React + FastAPI prototype with a working operator-facing UI
- Runtime-backed scenario state with approval, pause, resume, and scenario switching controls
- Streaming execution proof slice for the reporting-access path, including live command output and verification updates

## What is simulated today

- Runtime scenarios are still scenario-backed rather than sourced from a real agent runtime
- Command output is currently simulated to prove the control-plane/event model
- Slack/NemoClaw intake handoff is planned and documented, but not fully wired end-to-end yet

## What I am building next

- Real intake handoff from a conversational intake bot into TrustPlane
- Richer trust downgrade / suspended-mode behavior
- Runtime adapters that project real agent/runtime state into the TrustPlane contract

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

TrustPlane is an operator-facing surface for a governed agent runtime.

It is centered on:

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

Backend:
- `http://127.0.0.1:8011`
- health: `http://127.0.0.1:8011/api/health`

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
- `docs/` - architecture, trust model, intake, deployment, and integration docs

## Key docs

- `docs/index.md` — docs map and suggested reading order
- `docs/integration-contract.md` — runtime contract direction
- `docs/runtime-adapter-architecture.md` — backend adapter/projection model
- `docs/minimal-operator-team.md` — small deployable operator team
- `docs/trust-rating-model.md` — trust rubric direction
- `docs/live-command-observability.md` — CLI execution visibility model
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
