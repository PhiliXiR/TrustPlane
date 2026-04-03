# Local intake stack runbook

This runbook captures the currently working local Linux setup for the TrustPlane intake path.

## Working end-to-end path

Slack -> OpenClaw intake agent -> session transcript marker -> watcher -> n8n webhook -> TrustPlane `/api/intake`

## Key local URLs

- TrustPlane frontend: `http://127.0.0.1:4511`
- TrustPlane backend health: `http://127.0.0.1:8011/api/health`
- n8n UI: `http://127.0.0.1:5678`
- n8n production webhook: `http://127.0.0.1:5678/webhook/trustplane-intake`
- n8n test webhook: `http://127.0.0.1:5678/webhook-test/trustplane-intake`

## Important gotchas

### 1. n8n is running in Docker

That means the HTTP Request node inside `n8n` must not target host `localhost` for TrustPlane.

Use:

`http://host.docker.internal:8011/api/intake`

not:

`http://localhost:8011/api/intake`

The local `n8n` container was started with a host alias mapping so `host.docker.internal` resolves to the Docker host gateway.

### 2. TrustPlane backend must bind to `0.0.0.0`

If the backend binds only to `127.0.0.1`, the `n8n` container cannot reach it and the HTTP Request node will fail with `ECONNREFUSED`.

Working backend launch shape:

```bash
cd /home/philixir/_Dev/TrustPlane
./.venv/bin/python -m uvicorn backend.main:app --host 0.0.0.0 --port 8011
```

The repo `npm run backend` script should match this bind address.

### 3. Production webhook vs test webhook in n8n

- test URL works only while the editor is listening for a test event
- production URL works only when the workflow is active/registered

For always-on operation, use the production webhook:

`http://127.0.0.1:5678/webhook/trustplane-intake`

### 4. The watcher reads the intake session store, not Slack directly

Watcher store:

`/home/philixir/.openclaw/agents/intake/sessions/sessions.json`

Watcher state file:

`/home/philixir/.openclaw/workspaces/intake-bot/.openclaw/handoff-watcher-state.json`

The intake bot must emit a message containing the marker line:

`TRUSTPLANE_INTAKE_PAYLOAD`

followed by the canonical payload so the local extractor can submit it.

## Commands

### TrustPlane backend

```bash
cd /home/philixir/_Dev/TrustPlane
npm run backend
```

### TrustPlane frontend

```bash
cd /home/philixir/_Dev/TrustPlane
npm run dev
```

### Watcher

```bash
python3 /home/philixir/.openclaw/workspaces/intake-bot/scripts/intake_handoff_watcher.py --loop --interval 5 --verbose
```

### Combined local bring-up

```bash
/home/philixir/.openclaw/workspaces/intake-bot/scripts/run_always_on_stack.sh
```

## Minimal verification checklist

1. TrustPlane backend health returns 200
2. `n8n` UI is reachable
3. production webhook path is registered and returns 200 to the watcher/helper
4. `n8n` execution shows the webhook trigger and HTTP Request node running
5. a new intake record appears in TrustPlane

## Known-good artifacts

- starter workflow export: `ops/n8n/trustplane-intake-webhook.workflow.json`
- local smoke test: `scripts/smoke-test-intake.sh`

## Recommended next hardening steps

- make the combined bring-up script verify port ownership / bind mode more explicitly
- add response/assertion checks to the smoke test so it validates created records more directly
- capture one or two representative payload fixtures for repeatable regression testing
