# TrustPlane + n8n starter integration

## Goal

Get a minimal end-to-end handoff working:

1. n8n receives a webhook payload
2. n8n lightly normalizes / validates it
3. n8n forwards the payload to TrustPlane `POST /api/intake`
4. TrustPlane creates and displays the request

This keeps the system architecture clean:

- **OpenClaw intake bot** handles conversation and clarification
- **n8n** handles glue, routing, and deterministic integration steps
- **TrustPlane** remains the system of record for the intake/execution trace

## TrustPlane intake endpoint

Default local endpoint:

```text
POST http://127.0.0.1:8011/api/intake
```

Accepted payload shape:

```json
{
  "source": "slack",
  "userId": "U123456",
  "channelId": "C123456",
  "rawRequest": "Please grant me access to the reporting app for weekly finance reporting.",
  "requester": "Phil",
  "normalizedType": "access_request",
  "targetSystem": "reporting-app",
  "requestedEntitlement": "reporting.read",
  "businessReason": "Weekly finance reporting",
  "clarificationNeeded": false,
  "missingFields": [],
  "candidateWorkflows": ["grant_reporting_access"],
  "initialTrustMode": "human_approved_execution"
}
```

## Minimal webhook contract into n8n

For the first pass, have the intake bot or any test client send the same canonical JSON directly to n8n.

Recommended webhook body:

```json
{
  "source": "slack",
  "userId": "U123456",
  "channelId": "C123456",
  "rawRequest": "Please grant me access to the reporting app for weekly finance reporting.",
  "requester": "Phil",
  "normalizedType": "access_request",
  "targetSystem": "reporting-app",
  "requestedEntitlement": "reporting.read",
  "businessReason": "Weekly finance reporting",
  "clarificationNeeded": false,
  "missingFields": [],
  "candidateWorkflows": ["grant_reporting_access"],
  "initialTrustMode": "human_approved_execution"
}
```

That lets n8n act as a stable handoff layer without owning the ontology.

## Starter workflow

A starter import file lives at:

```text
ops/n8n/trustplane-intake-webhook.workflow.json
```

That starter workflow is meant to be treated as the known-good local baseline for the Linux prototype path.

Suggested flow:

- **Webhook** node
  - `POST`
  - path: `trustplane-intake`
- **Set** node
  - map/normalize defaults if fields are missing
- **HTTP Request** node
  - `POST http://host.docker.internal:8011/api/intake`
  - JSON body from the normalized fields
- **Respond to Webhook** node
  - return TrustPlane acceptance JSON

## Local URL notes

Because n8n is running in Docker and TrustPlane backend runs on the host, use:

```text
http://host.docker.internal:8011/api/intake
```

If that hostname is unavailable on this Linux Docker setup, add this to the n8n container later:

```text
--add-host=host.docker.internal:host-gateway
```

or use the host machine IP directly.

## Recommended first test

1. Open n8n at `http://127.0.0.1:5678`
2. Import the starter workflow JSON
3. Activate or test the workflow
4. Send a POST to the webhook with canonical intake JSON
5. Confirm TrustPlane shows the newly created request

## Next upgrade after this works

Once the round-trip is proven, the Slack intake agent should send its normalized output to the n8n webhook.

That gives you:

- conversational intake in OpenClaw
- stable automation routing in n8n
- visible request/execution tracking in TrustPlane

## Smoke test

A local smoke-test helper now lives at:

```text
scripts/smoke-test-intake.sh
```

It:

1. checks TrustPlane backend health
2. posts a canned canonical intake payload to the production `n8n` webhook
3. prints the response and prompts you to confirm the created record in the TrustPlane UI

## Suggested next improvements

- add a request schema validator in n8n
- stamp `receivedAt` / correlation ids / source metadata
- enrich with Slack channel/user lookup when needed
- branch by `normalizedType`
- send execution or approval notifications back out through n8n
