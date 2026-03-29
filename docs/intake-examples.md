# Intake Examples

## Purpose

This document gives concrete examples of how external intake surfaces can feed TrustPlane.

The point is to show that TrustPlane can own governed intake logic without needing to own every external front door itself.

## Example 1 — Slack access request

### Raw request

```text
hey, can you give me access to the reporting dashboard before tomorrow’s review?
```

### Intake interpretation goals

- identify request type
- identify target system
- identify likely entitlement
- detect ambiguity
- determine whether clarification is required
- determine initial trust / delegation mode

### Example normalized output

```json
{
  "source": "slack",
  "normalizedType": "access_request",
  "targetSystem": "reporting",
  "requestedEntitlement": "reporting.read",
  "clarificationNeeded": false,
  "candidateWorkflows": ["access_request_standard"],
  "initialTrustMode": "human_approved_execution"
}
```

### Why it matters

The Slack UI is not the important part.
The important part is the governed normalization and admission logic behind it.

## Example 2 — Jira infrastructure change request

### Raw request

```text
Summary: Update VPN access policy for remote contractors
Description: tighten split tunnel rules before maintenance window
Priority: High
Change window: Saturday 22:00
```

### Intake interpretation goals

- classify as infrastructure change
- identify target system
- infer risk posture
- determine whether human execution is required
- check whether structured fields are complete enough to proceed

### Example normalized output

```json
{
  "source": "jira",
  "normalizedType": "infrastructure_change",
  "targetSystem": "vpn-policy",
  "clarificationNeeded": false,
  "candidateWorkflows": ["vpn_policy_standard_change"],
  "initialTrustMode": "human_executed_change"
}
```

### Why it matters

Even when Jira provides structured fields, TrustPlane still owns the governance logic that decides whether the runtime may proceed and under what trust boundary.

## Example 3 — Slack ambiguous request requiring clarification

### Raw request

```text
can you give me admin access to the dashboard?
```

### Intake interpretation goals

- detect missing environment
- detect missing justification
- avoid routing directly into an execution path
- surface clarification-needed state

### Example normalized output

```json
{
  "source": "slack",
  "normalizedType": "access_request",
  "targetSystem": "unknown",
  "requestedEntitlement": "admin",
  "clarificationNeeded": true,
  "missingFields": ["environment", "business_justification"],
  "candidateWorkflows": [],
  "initialTrustMode": "suggest_only"
}
```

### Why it matters

This is where TrustPlane proves that intake governance begins before workflow selection.

## Takeaway

External surfaces like Slack and Jira can vary.
TrustPlane’s job is to turn those raw requests into governed runtime objects with visible ambiguity handling, workflow candidacy, and initial trust posture.
