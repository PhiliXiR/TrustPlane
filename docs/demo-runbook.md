# TrustPlane Demo Runbook

This runbook is for showing TrustPlane in its current scope as a clear, coherent demo.

## Demo objective

Show TrustPlane as:

- the operator-facing control plane for governed agent execution
- centered on the Execution Record
- making intake, trust boundaries, approval, execution, verification, and evidence legible

## Recommended demo order

1. **Start with the reporting access flow**
   - this is the cleanest trust-boundary story
2. **Then show the VPN policy flow**
   - this proves the model extends to higher-risk operator-agent execution
3. **Only then mention the Slack/OpenClaw/n8n path**
   - as the real intake story feeding the same control-plane model

## One-sentence framing

Use this line early:

> TrustPlane is the operator-facing control plane for governed agent execution, centered on the Execution Record.

## What to say before clicking anything

Suggested framing:

- This is not a ticketing system or a workflow builder.
- The main object here is an Execution Record.
- The record shows intent, policy basis, trust boundary, human review, execution, verification, and outcome in one place.

## Startup

### Backend

```bash
npm install
npm run backend:install
npm run backend
```

Backend endpoints:

- `http://127.0.0.1:8011`
- `http://127.0.0.1:8011/api/health`

### Frontend

In a second terminal:

```bash
npm run dev
```

Frontend:

- `http://127.0.0.1:4511`

## Reset to a known demo state

Before a fresh demo run:

1. Start backend and frontend.
2. Click **Reset demo state** in the UI.
3. Confirm the app returns to **Grant access to reporting app**.

What reset does today:

- returns the current runtime to the default hero flow
- clears persisted intake-created runtime scenarios
- clears leftover demo progress from prior runs

If you want the second hero flow immediately after reset, switch to:

- **Change VPN access policy**

This gives you a predictable baseline every time.

## Hero flow 1 — Reporting access request

### Goal

Show a human-approved governed access change.

### What to point out first

- the request title and current owner
- the trust boundary
- the approval state
- the fact that execution is prepared but not yet allowed
- the timeline and inspection/evidence surfaces

### Suggested narration

- The runtime has already normalized and classified the request.
- The operator has prepared the exact governed action.
- But the runtime cannot cross the trust boundary on its own.
- Human approval is required before execution.

### Actions

1. Open the reporting access record.
2. Pause on the approval boundary.
3. Show:
   - policy metadata
   - prepared tool action
   - human checkpoint
   - timeline event trail
4. Click **Approve** if needed in your current build flow.
5. Click **Release execution**.
6. Watch the execution output and verification progress.
7. End on the completed state and artifact/evidence surface.

### What matters in this flow

The audience should leave with:

- the agent did not self-authorize
- the execution path was bounded
- the action was observable
- verification was required
- evidence is part of completion

## Hero flow 2 — VPN policy change

### Goal

Show that the same model also works for a higher-risk operator-agent execution path.

### What to emphasize

- this is a higher-risk change
- approval has already happened
- the execution envelope is staged
- authority release and execution are distinct from planning
- verification still decides whether the record is complete

### Actions

1. Switch to the VPN policy record.
2. Show:
   - trust boundary
   - OpenShell execution substrate
   - rollback reference
   - current execution state
3. Release execution if the state requires it.
4. Watch execution and verification progress.
5. End on the completed record.

### What matters in this flow

The audience should see that TrustPlane is not just for app access requests.
It also governs riskier infrastructure actions without losing the same record shape.

## Intake-backed records during demos

If you create intake-backed records during a demo, use **Reset demo state** before the next demo run.

That prevents old intake-created scenarios from hanging around in the source selector and keeps the hero path clean.

## Mentioning the real intake story

Only after the hero flows are clear, mention:

- a real local Slack -> OpenClaw -> watcher -> n8n -> TrustPlane path exists
- intake-created requests can enter the same TrustPlane record model
- today, the operator-facing control-plane model is ahead of the fully real runtime adapters

## What is real today

Say this clearly:

- the request-centric UI is real
- intake ingestion is real
- request and timeline projection are real
- operator actions and state transitions are real in the prototype
- event streaming shape is real
- the local Slack/OpenClaw/n8n/TrustPlane handoff path is real

## What is simulated today

Also say this clearly:

- seeded scenarios still back key demo flows
- command execution output is simulated in the prototype flows
- verification and artifact completion in those hero flows are currently scenario-driven

## What not to over-explain

Avoid spending too much demo time on:

- internal migration details
- code architecture overlap
- why multiple source modes exist
- prototype caveats before the core value lands

Land the product first.
Explain internals second.

## Good stopping points

Pause when you can clearly show:

- a trust boundary
- a pending human checkpoint
- a prepared but not yet authorized action
- a live execution transition
- a completed and verified outcome

## Demo success test

The demo worked if the viewer can answer:

- What is the main object?
- Why didn’t the agent just do the thing?
- What had to be approved?
- What actually executed?
- How do we know the outcome is real?
- Where is the evidence?
