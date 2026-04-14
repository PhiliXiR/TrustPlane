# Docs Index

This index groups the current TrustPlane docs by purpose so the repo is easier to navigate.

## Core direction

- `product-thesis.md` — what TrustPlane is and why it exists
- `execution-records-brief.md` — why the Execution Record is the core product object
- `road-to-real-trustplane.md` — path from prototype to real system
- `mvp-build-order.md` — dependency-aware build sequence for the first credible slice
- `what-to-reuse-from-ai-it-team.md` — conceptual inheritance from `ai-it-team`
- `delegation-taxonomy.md` — trust level, delegation mode, and execution mode vocabulary

## Architecture

- `minimum-viable-integration-surface.md` — smallest credible operator-facing contract for TrustPlane
- `integration-contract.md` — broader operator-facing runtime contract direction
- `mvp-api-shape.md` — first practical request-centric API shape for the backend
- `event-taxonomy.md` — stable operator-facing event model for the first governed slice
- `request-lifecycle-state-model.md` — first-pass governed lifecycle and state transitions
- `runtime-adapter-architecture.md` — backend adapter/projection/control model
- `backend-plan.md` — backend direction and responsibilities
- `linux-deployment-shape.md` — Linux-first runtime hosting model
- `first-linux-deployment-instructions.md` — first-test Linux setup steps
- `openclaw-n8n-trustplane-role-map.md` — role split and handoff boundaries between OpenClaw, n8n, and TrustPlane
- `openclaw-slack-intake-plan.md` — staged plan for the OpenClaw Slack intake agent path

## Intake and external entry

- `intake-ownership.md` — why governed intake belongs in TrustPlane’s boundary
- `intake-examples.md` — compatibility pointer to the canonical example set
- `intake-submission-examples.md` — canonical example submissions with normalization and trust notes
- `intake-fixture-pack.md` — canonical fully fleshed example fixtures with clarification, timeline, lifecycle, and evidence expectations
- `slack-intake-slice.md` — smallest sane Slack integration slice
- `minimal-intake-agent-template.md` — deployable-ish intake agent workspace/config shape
- `n8n-integration-starter.md` — local n8n webhook-to-TrustPlane starter path
- `intake-agent-tuning-notes.md` — guidance for keeping the intake agent focused and reducing clarification churn
- `langfuse-and-defenseclaw-notes.md` — prompt observability notes and future security-integration evaluation

## Operators and team model

- `minimal-operator-team.md` — smallest believable operator team
- `operator-agent-config-examples.md` — matching runtime config examples for the intake/operator workspaces

## Trust and execution visibility

- `trust-rating-model.md` — rubric-based trust rating model
- `live-command-observability.md` — real-time command/stream visibility model

## Demo and presentation

- `demo-hardening-checklist.md` — prioritized checklist for making the current scope showable
- `demo-runbook.md` — recommended demo flow, framing, and talking points

## Planning and implementation

- `implementation-backlog.md` — concrete implementation queue derived from the MVP contract and roadmap
- `current-code-vs-mvp-contract.md` — gap map between the current repo implementation and the newer MVP contract
- `first-implementation-cut.md` — smallest practical contract-to-code migration pass

## Suggested reading order

If you are new to the repo, a good order is:

1. `product-thesis.md`
2. `execution-records-brief.md`
3. `minimum-viable-integration-surface.md`
4. `request-lifecycle-state-model.md`
5. `mvp-build-order.md`
6. `mvp-api-shape.md`
7. `event-taxonomy.md`
8. `runtime-adapter-architecture.md`
9. `minimal-operator-team.md`
10. `trust-rating-model.md`
11. `slack-intake-slice.md`
12. `first-linux-deployment-instructions.md`
