# Linux Deployment Shape

## Purpose

This document outlines a sensible Linux deployment shape for the real TrustPlane direction.

The goal is not to define a production-hardened architecture yet.
The goal is to give the project a believable runtime home for:

- long-running backend services
- OpenClaw Slack intake agent hosting
- runtime adapters
- command-line operator execution visibility

## Core idea

Use Linux as the primary environment for the real runtime-backed version of TrustPlane.

Windows remains fine for local prototyping, but Linux is the better home for the system when it needs to run continuously and support real operator/runtime flows.

## Why Linux fits better

Linux is better suited for:

- long-running service processes
- stable port and process management
- systemd supervision
- PTY and shell-heavy workflows
- logging and restart behavior
- remote hosting on VPS or self-hosted boxes

## Recommended first deployment model

Start with a single Linux host.

That host can run:

- TrustPlane frontend
- TrustPlane backend
- OpenClaw intake agent
- runtime adapters
- optional reverse proxy

This is the simplest believable deployment shape for the first serious external test.

## Suggested service layout

### 1. TrustPlane frontend

Role:

- serve the React UI
- connect to backend API
- connect to backend event stream

Can be served by:

- Vite preview for early testing
- a static file server
- Nginx or Caddy in front of built assets

### 2. TrustPlane backend

Role:

- expose runtime API
- expose intake API
- expose streaming events
- project runtime state into operator-safe objects
- mediate operator actions

Recommended stack:

- Python
- FastAPI
- SSE first, WebSocket later if needed

### 3. OpenClaw intake agent service

Role:

- connect to Slack
- receive incoming requests
- run clarification loop
- normalize intake objects
- post normalized requests into TrustPlane backend

This should be treated as a separate service from TrustPlane backend, even if they live on the same host.

### 4. Runtime adapter / operator execution service

Role:

- connect to operator runtimes
- capture command execution state
- capture stdout/stderr streams
- relay normalized execution events to TrustPlane backend

Early versions may keep this inside the backend.
Longer-term, this may become its own adapter layer.

### 5. Reverse proxy (optional but likely useful)

Role:

- terminate TLS
- route frontend and backend traffic
- expose a clean public hostname if needed

Nginx or Caddy would both be reasonable.

## Suggested single-host layout

Example shape:

- `trustplane-frontend` -> serves built UI
- `trustplane-backend` -> FastAPI on localhost
- `openclaw-intake` -> Slack bot/runtime service
- `trustplane-proxy` -> optional Nginx/Caddy

## Suggested port model

Example only:

- frontend static app: `127.0.0.1:4511` or served through proxy
- backend API: `127.0.0.1:8011`
- OpenClaw intake agent: internal service, no public port unless needed
- proxy: `80/443`

If exposed publicly, the proxy should be the public surface, not the raw backend.

## Process supervision

On Linux, these services should eventually be supervised with `systemd`.

### Example units later

- `trustplane-backend.service`
- `trustplane-frontend.service`
- `openclaw-intake.service`

That gives:

- restart on failure
- boot-time startup
- journal logs
- cleaner operational behavior

## Logging model

Linux deployment should make logs easy to inspect.

Useful log categories:

- backend API and event logs
- intake agent message/clarification logs
- runtime adapter/execution logs
- operator action logs

In early versions, journald may be enough.
Later, structured logs would help.

## Suggested directory layout

Example only:

```text
/opt/trustplane/
  frontend/
  backend/
  runtime/
  logs/
  config/

/opt/openclaw/
  intake-agent/
  config/
  logs/
```

Or if kept together:

```text
/opt/trustplane/
  frontend/
  backend/
  intake-agent/
  adapters/
  config/
  logs/
```

The exact layout matters less than keeping services explicit and separable.

## Environment and secrets

The Linux host should handle:

- Slack tokens
- backend environment variables
- runtime credentials
- API keys

These should be kept out of public repo content.

For early deployment:

- environment files
- systemd environment entries
- or simple secret files with restricted permissions

Later, a better secrets model may be worthwhile.

## Recommended first Linux target

Use something simple and boring.

Good candidates:

- Ubuntu VPS
- Debian VM
- local Linux mini PC
- homelab VM

The first goal is stable iteration, not cloud-native sophistication.

## First deployment milestone

A good first Linux milestone would be:

- TrustPlane backend runs as a service
- frontend is reachable locally or through a proxy
- OpenClaw intake agent connects to Slack
- one normalized Slack request reaches TrustPlane
- one request can move into a visible operator path

That is enough to justify the Linux move.

## What not to overbuild yet

Avoid prematurely adding:

- multi-host distribution
- kubernetes
- complex queue infrastructure
- elaborate service mesh ideas
- high-availability concerns

A single Linux host is enough for the first serious test.

## Suggested next planning docs

Useful next follow-ons could be:

- systemd service examples
- reverse proxy layout
- environment variable checklist
- first Linux setup checklist
- OpenClaw service boundary notes

## Summary

The most sensible real deployment direction is:

- Linux host
- TrustPlane frontend + backend
- OpenClaw Slack intake agent as a separate service
- optional reverse proxy
- systemd-managed processes
- backend-centered event and control model

That is a believable home for the real version of the project.
