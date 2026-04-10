# TrustPlane Demo Hardening Checklist

This checklist is for getting TrustPlane into a strong showable state in its current scope.

The goal is not to broaden the product.
The goal is to make the current product thesis land clearly, cleanly, and confidently.

## Demo goal

TrustPlane should demo as:

- a trust-first control plane for governed agent work
- centered on a first-class Execution Record
- with a clear beginning, trust boundary, execution path, verification step, and outcome artifact
- with one believable real-world intake story and two strong operator-facing example flows

## Core demo rule

For demo purposes, TrustPlane should optimize for:

- clarity over coverage
- coherence over flexibility
- confidence over exhaustiveness
- one strong story over many partial stories

## Priority 0 — Protect the hero story

### 0.1 Lock the primary demo flows

TrustPlane should show exactly two hero flows:

1. **Reporting access request**
   - human-approved governed access change
2. **VPN policy change**
   - approved operator-agent execution with verification

These two flows are enough to demonstrate:

- intake normalization
- request ownership and routing
- policy basis
- trust boundary
- approval and release logic
- execution record progression
- verification and artifacts

### 0.2 Define the product line in one sentence

Use one stable demo line everywhere:

> TrustPlane is the operator-facing control plane for governed agent execution, centered on the Execution Record.

Everything in the repo and UI should support this sentence.

### 0.3 Define the current truth cleanly

The demo should clearly distinguish:

**Real today**
- request-centric control-plane UI
- intake ingestion into TrustPlane
- request projection and timeline state
- operator controls for approve, deny, pause, resume, and release
- event streaming shape
- local Slack/OpenClaw/n8n/TrustPlane handoff path

**Simulated today**
- runtime scenarios as the backing execution source in key flows
- command execution output in the demo scenarios
- verification events and final artifact generation in seeded runtime scenarios

This should be stated once, clearly, without apologizing.

## Priority 1 — Make the Execution Record unmistakable

### 1.1 Promote the Execution Record as the primary object

The UI should make it obvious that the user is reading one governed record with these sections:

- Intent
- Plan / workflow path
- Actions
- Outputs
- Review
- Outcome

Even if the internal components differ, the visible product experience should feel like one record.

### 1.2 Tighten language around panels and labels

Prefer names that reinforce the product object:

- Execution Record
- Record source
- Review and authority
- Action timeline
- Execution evidence
- Outcome and verification

Avoid terminology that foregrounds prototype internals unless needed.

### 1.3 Make the final state satisfying

A completed request should feel complete.

The visible end state should clearly show:

- what was intended
- what was approved
- what was executed
- what was verified
- what evidence was captured
- what the final outcome was

The user should not need to infer completion from scattered panels.

## Priority 2 — Reduce demo confusion

### 2.1 Make source selection clearer and more deliberate

The current source switching is useful, but the demo should not feel split across multiple competing modes.

Recommended demo posture:

- default to a primary hero record
- label examples explicitly as examples
- treat alternate sources as secondary exploration, not the main product message

### 2.2 Reduce visible prototype pluralism

The app currently exposes several overlapping concepts:

- runtime scenarios
n- example fixtures
- request projections
- live intake-backed records

These should be presented as a coherent record surface, not as multiple partially overlapping systems.

### 2.3 Emphasize the request-centric view over the transition mechanics

The demo should foreground the request-facing contract.

Internal migration language such as:

- bridge
n- older scenario-backed store
- overlap
- projection from legacy runtime

should stay mostly in code comments and deep docs, not in the demo experience.

## Priority 3 — Package the real-vs-simulated story better

### 3.1 Add a concise demo framing section to README

The README should quickly answer:

- what TrustPlane is
- what the best demo path is
- what is real today
- what is simulated today
- why the current prototype is still meaningful

### 3.2 Add a demo runbook

Create a short operator-facing runbook with:

- how to start backend and frontend
- which flow to show first
- which buttons to click
- what moment to pause on
- what to say about the trust boundary
- how to show the execution record completing

### 3.3 Add screenshots or GIFs

The README currently calls for this.
This should be completed.

Minimum assets:

1. request overview
2. trust boundary + approval checkpoint
3. execution / verification / evidence state
4. completed outcome record

## Priority 4 — Tighten the repo for showability

### 4.1 Clean the working tree intentionally

Before showing off, decide whether current uncommitted UI work is:

- part of the demo polish and should be finished
- experimental and should be removed
- incomplete and should be hidden until ready

A showable demo should not depend on ambiguous in-flight edits.

### 4.2 Add a demo reset path

There should be a simple way to reset to a known state for demo runs.

At minimum, document:

- how to start from the seeded access flow
- how to start from the seeded VPN flow
- how to re-create a clean intake-backed request
- how to clear persisted intake scenario state if needed

### 4.3 Verify happy-path build and startup

The demo repo should reliably support:

- `npm install`
- `npm run backend:install`
- `npm run backend`
- `npm run dev`
- `npm run build`

Any rough edges here reduce trust in the product.

## Priority 5 — Strengthen the operator feel

### 5.1 Make the trust boundary legible at a glance

At any point in the hero flows, an operator should be able to answer:

- who owns this request
- what authority is available
- what is blocked
- what human action is required
- what will happen next

### 5.2 Make execution evidence feel attached to the record

Live output is useful, but the product should feel like the output belongs to the record.

The operator should feel that:

- execution happened under this authority
- verification happened against this request
- the artifact closes this specific record

### 5.3 Make examples feel canonical, not second-class

If examples remain in the UI, they should feel like:

- canonical curated demo records
- representative cases
- intentional showcases of trust patterns

not fallback placeholders.

## Suggested implementation order

1. tighten source selection and hero framing in the UI
2. strengthen Execution Record language in the main surface
3. make completion/outcome state feel more explicit
4. add README demo framing
5. add demo runbook
6. add screenshots/GIF placeholders or real assets
7. add reset instructions
8. clean working tree and finalize demo-facing changes

## Immediate next repo changes

The highest-value first changes are:

1. UI copy and framing cleanup
   - make the top-level surface feel more explicitly like an Execution Record
   - make source selection feel secondary and intentional

2. README cleanup
   - add demo framing
   - add a real-vs-simulated section with stronger wording
   - add a short best-path demo script

3. Demo docs
   - add a `docs/demo-runbook.md`
   - add a `docs/demo-hardening-checklist.md`

## Success criteria

TrustPlane is demo-ready when a new viewer can understand, within a few minutes:

- what the product is
- what object they are looking at
- where the trust boundary is
- what authority has or has not been granted
- what execution happened
- what evidence proves the outcome
- what is real today versus simulated today

If those points land quickly and cleanly, the demo is doing its job.
