# First Linux Deployment Instructions

## Purpose

This document gives step-by-step instructions for the first serious Linux-based TrustPlane test environment.

The goal is not full production deployment.
The goal is to stand up a believable first external test environment for:

- TrustPlane frontend/backend
- future OpenClaw intake integration
- governed request visibility
- streamed operator execution visibility

## Important honesty note

Some parts of TrustPlane are already implemented.
Some parts are still planned.

### Working today

- frontend UI
- FastAPI backend
- scenario-backed runtime
- streamed execution proof slice for reporting access
- deployable-looking workspace and agent config examples
- generic intake endpoint at `POST /api/intake`
- manual local intake submission into the dashboard
- lightweight intake-request persistence

### Planned but not yet fully implemented

- automatic Slack -> dedicated intake-agent routing
- automatic intake-agent submission into TrustPlane from the live chat path
- full downstream operator-agent execution path from real intake traffic

This document gets the environment ready for the first real test path and makes clear where manual testing ends and new implementation begins.

## Deployment target

Use a single Linux host for the first test.

Recommended:

- Ubuntu 24.04 LTS
- Debian 12

## Phase 1 — prepare the Linux host

### 1. Update packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install core tools

```bash
sudo apt install -y git curl build-essential python3 python3-venv python3-pip
```

### 3. Install Node.js

A simple path is NodeSource or nvm.

Example with NodeSource for Node 20:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 4. Verify versions

```bash
node -v
npm -v
python3 --version
```

## Phase 2 — clone TrustPlane

### 1. Choose a location

Example:

```bash
sudo mkdir -p /opt/trustplane
sudo chown $USER:$USER /opt/trustplane
cd /opt/trustplane
```

### 2. Clone the repo

```bash
git clone https://github.com/PhiliXiR/TrustPlane.git .
```

## Phase 3 — set up TrustPlane backend/frontend

### 1. Install frontend dependencies

```bash
cd /opt/trustplane
npm install
```

### 2. Create Python virtual environment

```bash
python3 -m venv .venv
```

### 3. Install backend dependencies

```bash
source .venv/bin/activate
pip install -r backend/requirements.txt
```

Or if the package script is preferred:

```bash
npm run backend:install
```

### 4. Start backend

```bash
source .venv/bin/activate
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8011
```

### 5. In a second shell, start frontend

```bash
cd /opt/trustplane
npm run dev
```

## Phase 4 — verify current TrustPlane behavior

### 1. Check backend health

Open or curl:

```bash
curl http://127.0.0.1:8011/api/health
```

Expected:

```json
{"ok": true}
```

### 2. Check runtime snapshot

```bash
curl http://127.0.0.1:8011/api/runtime
```

### 3. Open frontend

Expected local URL:

- `http://127.0.0.1:4511`

### 4. Verify streaming proof slice

In the UI:

1. choose the reporting-access scenario
2. click approve
3. confirm you see:
   - live command output panel
   - state progression over time
   - verification completion

If this works, the base TrustPlane environment is running correctly.

## Phase 5 — decide hosting mode for the first test

At this point, choose one of two modes.

### Mode A — local-only Linux test

Use this if you just want to validate the runtime/UI behavior on Linux.

No reverse proxy required yet.

### Mode B — externally reachable Linux test

Use this if you want to eventually let Slack or another external surface talk to the host.

For this mode, plan to add:

- reverse proxy
- public hostname or tunnel
- TLS
- controlled backend exposure

Do not expose raw dev ports directly to the internet.

## Phase 6 — prepare for future intake endpoint work

This part is not fully implemented yet, but the environment should be prepared with the expected shape.

## Intake endpoint status

TrustPlane now has a working generic intake endpoint:

```http
POST /api/intake
```

A Slack-specific path also exists, but the generic intake route is enough for the first Linux test loop.

## Planned payload example

```json
{
  "source": "slack",
  "userId": "U12345",
  "channelId": "C12345",
  "rawRequest": "Can I get access to the reporting dashboard?",
  "requester": "alice@example.com",
  "normalizedType": "access_request",
  "targetSystem": "reporting",
  "requestedEntitlement": "reporting.read",
  "businessReason": "weekly dashboard review",
  "clarificationNeeded": false,
  "missingFields": [],
  "candidateWorkflows": ["access_request_standard"],
  "initialTrustMode": "human_approved_execution"
}
```

## Temporary manual test before Slack exists

Once that intake endpoint exists, the first manual test should be:

```bash
curl -X POST http://127.0.0.1:8011/api/intake/slack \
  -H 'Content-Type: application/json' \
  -d '{
    "source": "slack",
    "userId": "U12345",
    "channelId": "C12345",
    "rawRequest": "Can I get access to the reporting dashboard?",
    "requester": "alice@example.com",
    "normalizedType": "access_request",
    "targetSystem": "reporting",
    "requestedEntitlement": "reporting.read",
    "businessReason": "weekly dashboard review",
    "clarificationNeeded": false,
    "missingFields": [],
    "candidateWorkflows": ["access_request_standard"],
    "initialTrustMode": "human_approved_execution"
  }'
```

That should create the request without requiring Slack on day one.

## Phase 7 — prepare OpenClaw intake agent on Linux

This phase depends on the OpenClaw setup you choose, but the desired service role is clear.

### OpenClaw should do

- connect to Slack
- receive requests
- ask short clarification questions
- normalize the intake object
- POST the normalized request to TrustPlane backend

### OpenClaw should not do in v1

- risky execution
- approvals
- broad workflow control
- deep downstream orchestration

Keep it intake-only.

## Phase 8 — Slack bot test plan

Once OpenClaw is connected to Slack and the intake endpoint exists:

### Happy-path test

1. user sends: `Can I get access to the reporting dashboard?`
2. OpenClaw asks for any missing detail
3. user responds
4. OpenClaw submits normalized request to TrustPlane
5. TrustPlane shows request source = Slack

### Ambiguous-path test

1. user sends: `Give me admin on the dashboard`
2. OpenClaw asks for missing environment and justification
3. request remains in clarification-needed state until enough info exists

## Phase 9 — optional reverse proxy setup later

When you want Slack or external traffic to reach the host safely, add a reverse proxy.

Reasonable options:

- Nginx
- Caddy

The backend should ideally stay behind the proxy, not be directly exposed.

## Phase 10 — optional systemd services later

When you want persistence and restart behavior, add services like:

- `trustplane-backend.service`
- `trustplane-frontend.service`
- `openclaw-intake.service`

This is not required for the first bootstrapping pass, but it is the right next operational step.

## What to verify before moving on

Before adding Slack, confirm:

- backend starts cleanly
- frontend loads cleanly
- streamed execution proof slice works
- no unexplained port conflicts exist
- Linux host can keep services running reliably

Before adding the OpenClaw intake agent, confirm:

- you know the intake payload contract
- you know the endpoint URL the OpenClaw intake agent should call
- TrustPlane can visibly represent intake source and normalized request state

## Summary

The first Linux-based TrustPlane deployment is:

1. prepare Linux host
2. clone repo
3. install Node and Python deps
4. run backend/frontend
5. verify streaming proof slice
6. prepare intake endpoint shape
7. prepare OpenClaw intake agent
8. connect Slack only after the intake path is ready

That gives you a controlled path from local prototype toward a real external test environment.
