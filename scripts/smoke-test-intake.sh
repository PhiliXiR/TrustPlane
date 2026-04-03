#!/usr/bin/env bash
set -euo pipefail

WEBHOOK_URL="${TRUSTPLANE_N8N_WEBHOOK_URL:-http://127.0.0.1:5678/webhook/trustplane-intake}"
HEALTH_URL="${TRUSTPLANE_HEALTH_URL:-http://127.0.0.1:8011/api/health}"
UI_URL="${TRUSTPLANE_UI_URL:-http://127.0.0.1:4511}"

PAYLOAD='{
  "source": "smoke-test",
  "userId": "local-smoke-test",
  "channelId": "channel:local-smoke-test",
  "rawRequest": "Please grant reporting access for weekly finance review.",
  "requester": "local-smoke-test",
  "normalizedType": "access_request",
  "targetSystem": "reporting",
  "requestedEntitlement": "reporting.read",
  "businessReason": "weekly finance review",
  "clarificationNeeded": false,
  "missingFields": [],
  "candidateWorkflows": ["access_request_standard"],
  "initialTrustMode": "human_approved_execution"
}'

printf '== TrustPlane health ==\n'
curl -fsS "$HEALTH_URL" && printf '\n\n'

printf '== Posting smoke-test payload to n8n webhook ==\n'
RESPONSE="$(curl -fsS -X POST "$WEBHOOK_URL" -H 'Content-Type: application/json' --data "$PAYLOAD")"
printf '%s\n\n' "$RESPONSE"

printf '== Next check ==\n'
printf 'Open %s and confirm a new intake/execution record appeared.\n' "$UI_URL"
