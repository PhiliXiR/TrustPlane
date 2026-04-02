# Docs Index

This index groups the current TrustPlane docs by purpose so the repo is easier to navigate.

## Core direction

- `product-thesis.md` — what TrustPlane is and why it exists
- `road-to-real-trustplane.md` — path from prototype to real system
- `what-to-reuse-from-ai-it-team.md` — conceptual inheritance from `ai-it-team`
- `delegation-taxonomy.md` — trust level, delegation mode, and execution mode vocabulary

## Architecture

- `integration-contract.md` — operator-facing runtime contract shape
- `runtime-adapter-architecture.md` — backend adapter/projection/control model
- `backend-plan.md` — backend direction and responsibilities
- `linux-deployment-shape.md` — Linux-first runtime hosting model
- `first-linux-deployment-instructions.md` — first-test Linux setup steps
- `execution-records-brief.md` — sharper product framing around Execution Records as the primary object

## Intake and external entry

- `intake-ownership.md` — why governed intake belongs in TrustPlane’s boundary
- `intake-examples.md` — Slack/Jira-style intake examples
- `slack-intake-slice.md` — smallest sane Slack integration slice
- `nemoclaw-slack-intake-plan.md` — staged plan for NemoClaw as Slack intake bot
- `minimal-intake-bot-template.md` — deployable-ish intake bot workspace/config shape
- `n8n-integration-starter.md` — local n8n webhook-to-TrustPlane starter path
- `intake-agent-tuning-notes.md` — guidance for keeping the intake bot focused and reducing clarification churn

## Operators and team model

- `minimal-operator-team.md` — smallest believable operator team
- `operator-agent-config-examples.md` — matching runtime config examples for the intake/operator workspaces

## Trust and execution visibility

- `trust-rating-model.md` — rubric-based trust rating model
- `live-command-observability.md` — real-time command/stream visibility model

## Suggested reading order

If you are new to the repo, a good order is:

1. `product-thesis.md`
2. `delegation-taxonomy.md`
3. `integration-contract.md`
4. `runtime-adapter-architecture.md`
5. `minimal-operator-team.md`
6. `trust-rating-model.md`
7. `live-command-observability.md`
8. `nemoclaw-slack-intake-plan.md`
9. `first-linux-deployment-instructions.md`
