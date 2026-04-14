# Intake Fixture Pack

## Purpose

This document expands the curated intake submissions into full fixture-style examples for the implemented intake-agent -> watcher -> `n8n` -> TrustPlane path.

These examples are meant to be useful for:

- demos
- intake-agent prompt tuning
- `n8n` normalization validation
- TrustPlane operator-surface testing
- future regression fixture design

Each fixture includes:

1. raw intake message
2. expected clarification behavior
3. expected normalized `n8n` output
4. expected TrustPlane request snapshot summary
5. expected lifecycle posture
6. expected timeline events
7. expected evidence artifacts
8. notes on what the example demonstrates

These are written to be readable by humans first while still being structured enough to guide future testing.

## Canonical vocabulary used in this pack

### Initial trust posture values

- `human_approved_execution`
- `clarify_then_route`
- `observe_and_escalate`

### Canonical workflow candidate families

- `access_request_standard`
- `shared_drive_access_request`
- `vpn_access_request`
- `offboarding_access_removal`
- `mailbox_access_request`
- `service_restart_request`
- `cloud_cleanup_reviewed`
- `credential_revoke_or_rotate`
- `incident_triage_investigate_only`
- `staging_worker_recovery`

## Matrix summary

| # | Example | Category | Clarification | Initial Trust | Candidate Workflow | Expected Path | Approval Expected |
|---|---|---|---|---|---|---|---|
| 1 | Reporting dashboard access | IT / access | No | `human_approved_execution` | `access_request_standard` | execute | Yes |
| 2 | Finance shared drive access | IT / access | Yes | `clarify_then_route` | `shared_drive_access_request` | execute | Yes |
| 3 | Contractor VPN access | IT / VPN | Yes | `clarify_then_route` | `vpn_access_request` | execute | Yes |
| 4 | Offboarding access removal | IT / offboarding | No | `human_approved_execution` | `offboarding_access_removal` | execute | Yes |
| 5 | Shared mailbox access | IT / mailbox | Yes | `clarify_then_route` | `mailbox_access_request` | execute | Yes |
| 6 | Restart staging web service | AWS / ops | Yes | `clarify_then_route` | `service_restart_request` | execute | Yes |
| 7 | Clean up unattached EBS volumes | AWS / cleanup | Yes | `clarify_then_route` | `cloud_cleanup_reviewed` | execute | Yes |
| 8 | Revoke stale IAM credential | AWS / security | Yes | `clarify_then_route` | `credential_revoke_or_rotate` | execute | Yes |
| 9 | Investigate CPU spike on prod | AWS / incident | Yes | `observe_and_escalate` | `incident_triage_investigate_only` | investigate | Usually yes |
| 10 | Restart failed staging worker | AWS / ops | No | `human_approved_execution` | `staging_worker_recovery` | execute | Yes |

---

# Fixture 1 — Reporting dashboard access request

## Raw intake message

> Hey, can someone give Jamie access to the reporting dashboard? They’re helping with the Monday metrics review.

## Expected intake-agent behavior

### Clarification behavior
No clarification required if Jamie’s identity is resolvable through the identity provider.

### Ideal intake-agent response
> Got it — I’ll route a reporting dashboard access request for Jamie tied to the Monday metrics review.

## Expected normalized `n8n` output

```json
{
  "source": "slack",
  "requester": "Jamie",
  "rawRequest": "Hey, can someone give Jamie access to the reporting dashboard? They’re helping with the Monday metrics review.",
  "normalizedType": "access_request",
  "targetSystem": "reporting_dashboard",
  "requestedEntitlement": "reporting.read",
  "businessReason": "helping with Monday metrics review",
  "clarificationNeeded": false,
  "missingFields": [],
  "candidateWorkflows": ["access_request_standard"],
  "initialTrustMode": "human_approved_execution",
  "metadata": {
    "resourceName": "reporting_dashboard",
    "accessScope": "read"
  }
}
```

## Expected TrustPlane request snapshot summary

- **request title:** Access Request · reporting_dashboard
- **current state:** `awaiting_review`
- **current owner:** operator
- **workflow candidate:** `access_request_standard`
- **trust level:** `bounded`
- **policy decision:** held pending human approval
- **pending action:** prepare access grant for `reporting.read`
- **verification expectation:** confirm final entitlement state
- **operator summary:** Temporary reporting dashboard access for Jamie tied to Monday metrics review.

## Expected lifecycle posture

- `intake_received`
- `normalized`
- `admitted`
- `awaiting_review`

## Expected timeline events

1. `intake.request.received`
2. `intake.request.normalized`
3. `intake.request.admitted`
4. `workflow.playbook.selected`
5. `ownership.transferred`
6. `policy.decision.changed`
7. `human.approval.requested`
8. `execution.change.prepared`

## Expected evidence artifacts

- policy snapshot for reporting access rule
- entitlement verification artifact showing final reporting membership

## What this demonstrates

- clean low-ambiguity intake
- access-request normalization
- straightforward governed routing
- approval-gated moderate-risk request

---

# Fixture 2 — Add user to finance shared drive

## Raw intake message

> Need Priya added to the Finance shared drive for month-end close.

## Expected intake-agent behavior

### Clarification behavior
Clarification required.

### Ideal clarification transcript
**Bot:** Which exact Finance shared drive or group should Priya be added to?

**Requester:** The Finance Close shared drive.

**Bot:** Is this temporary access for month-end close or should it remain ongoing?

**Requester:** Temporary for this week only.

### Ideal intake-agent response after clarification
> Thanks — I’ll route a temporary Finance Close shared-drive access request for Priya tied to month-end close.

## Expected normalized `n8n` output

```json
{
  "source": "slack",
  "requester": "Priya",
  "rawRequest": "Need Priya added to the Finance shared drive for month-end close.",
  "normalizedType": "access_request",
  "targetSystem": "google_workspace",
  "requestedEntitlement": "finance_close_shared_drive_access",
  "businessReason": "month-end close",
  "clarificationNeeded": false,
  "missingFields": [],
  "candidateWorkflows": ["shared_drive_access_request"],
  "initialTrustMode": "human_approved_execution",
  "metadata": {
    "resourceName": "Finance Close shared drive",
    "duration": "temporary_this_week"
  }
}
```

## Expected TrustPlane request snapshot summary

- **request title:** Access Request · google_workspace
- **current state:** `awaiting_review`
- **current owner:** operator
- **workflow candidate:** `shared_drive_access_request`
- **trust level:** `bounded`
- **policy decision:** held pending review because resource access is temporary but sensitive
- **pending action:** prepare shared-drive membership grant with duration note
- **verification expectation:** confirm group/drive membership applied and duration recorded
- **operator summary:** Temporary Finance Close shared-drive access for Priya tied to month-end close.

## Expected lifecycle posture

- `intake_received`
- `clarification_needed`
- `normalized`
- `admitted`
- `awaiting_review`

## Expected timeline events

1. `intake.request.received`
2. `intake.clarification.requested`
3. `intake.clarification.received`
4. `intake.request.normalized`
5. `intake.request.admitted`
6. `workflow.playbook.selected`
7. `ownership.transferred`
8. `policy.decision.changed`
9. `human.approval.requested`
10. `execution.change.prepared`

## Expected evidence artifacts

- policy snapshot for shared-drive delegation rule
- membership verification artifact
- temporary-duration annotation artifact or audit note

## What this demonstrates

- clarification loop quality
- resource-scope capture
- temporary access semantics
- TrustPlane handling of clarified request progression

---

# Fixture 3 — VPN access for contractor

## Raw intake message

> Can we get VPN access set up for the new contractor starting tomorrow? Name is Alex, working with infra for two weeks.

## Expected intake-agent behavior

### Clarification behavior
Clarification required.

### Ideal clarification transcript
**Bot:** Which Alex is this? I need the contractor’s email or directory identity.

**Requester:** alex.rivera.contractor@vendorco.com

**Bot:** Which VPN profile or internal network segment should Alex receive access to?

**Requester:** Infra contractor VPN profile only.

**Bot:** Who is the approving manager for this contractor access?

**Requester:** Dana approved it.

### Ideal intake-agent response after clarification
> Got it — I’ll route a contractor VPN access request for Alex Rivera with the infra contractor VPN profile and Dana as sponsor.

## Expected normalized `n8n` output

```json
{
  "source": "slack",
  "requester": "Alex Rivera",
  "rawRequest": "Can we get VPN access set up for the new contractor starting tomorrow? Name is Alex, working with infra for two weeks.",
  "normalizedType": "vpn_access_request",
  "targetSystem": "corporate_vpn",
  "requestedEntitlement": "vpn.contractor.infra",
  "businessReason": "infra contractor onboarding for two-week engagement",
  "clarificationNeeded": false,
  "missingFields": [],
  "candidateWorkflows": ["vpn_access_request"],
  "initialTrustMode": "human_approved_execution",
  "metadata": {
    "directoryIdentity": "alex.rivera.contractor@vendorco.com",
    "vpnProfile": "infra_contractor",
    "approvingManager": "Dana",
    "duration": "2_weeks"
  }
}
```

## Expected TrustPlane request snapshot summary

- **request title:** VPN Access Request · corporate_vpn
- **current state:** `awaiting_review`
- **current owner:** operator
- **workflow candidate:** `vpn_access_request`
- **trust level:** `bounded`
- **policy decision:** held because contractor VPN access requires explicit review
- **pending action:** prepare contractor VPN profile assignment
- **verification expectation:** confirm VPN profile and expiration window
- **operator summary:** Contractor VPN profile request for Alex Rivera with infra-contractor scope and two-week duration.

## Expected lifecycle posture

- `intake_received`
- `clarification_needed`
- `normalized`
- `admitted`
- `awaiting_review`

## Expected timeline events

1. `intake.request.received`
2. `intake.clarification.requested`
3. `intake.clarification.received`
4. `intake.request.normalized`
5. `intake.request.admitted`
6. `workflow.playbook.selected`
7. `policy.decision.changed`
8. `human.approval.requested`
9. `execution.change.prepared`

## Expected evidence artifacts

- policy snapshot for contractor VPN access
- contractor identity verification artifact
- VPN profile assignment verification artifact

## What this demonstrates

- higher-sensitivity access handling
- contractor identity resolution
- sponsor capture
- duration-limited access semantics

---

# Fixture 4 — Remove former employee VPN and group access

## Raw intake message

> Please remove Morgan’s VPN and internal group access today — they left Friday.

## Expected intake-agent behavior

### Clarification behavior
Minimal clarification only if Morgan cannot be resolved.
Otherwise proceed directly.

### Ideal intake-agent response
> Understood — I’ll route an offboarding access-removal request for Morgan covering VPN and internal group access.

## Expected normalized `n8n` output

```json
{
  "source": "slack",
  "requester": "Morgan",
  "rawRequest": "Please remove Morgan’s VPN and internal group access today — they left Friday.",
  "normalizedType": "deprovision_request",
  "targetSystem": "identity_and_access",
  "requestedEntitlement": "remove_vpn_and_group_access",
  "businessReason": "employee departure offboarding",
  "clarificationNeeded": false,
  "missingFields": [],
  "candidateWorkflows": ["offboarding_access_removal"],
  "initialTrustMode": "human_approved_execution"
}
```

## Expected TrustPlane request snapshot summary

- **request title:** Deprovision Request · identity_and_access
- **current state:** `awaiting_review`
- **current owner:** operator
- **workflow candidate:** `offboarding_access_removal`
- **trust level:** `bounded`
- **policy decision:** held for confirmation/review
- **pending action:** prepare access-removal changes
- **verification expectation:** confirm VPN access removed and target groups removed
- **operator summary:** Offboarding access-removal request for Morgan covering VPN and internal groups.

## Expected lifecycle posture

- `intake_received`
- `normalized`
- `admitted`
- `awaiting_review`

## Expected timeline events

1. `intake.request.received`
2. `intake.request.normalized`
3. `intake.request.admitted`
4. `workflow.playbook.selected`
5. `ownership.transferred`
6. `policy.decision.changed`
7. `human.approval.requested`
8. `execution.change.prepared`

## Expected evidence artifacts

- offboarding policy snapshot
- entitlement removal verification artifact
- group-membership removal verification artifact

## What this demonstrates

- deprovisioning flow
- lower-risk-but-still-governed access removal
- offboarding posture

---

# Fixture 5 — Shared mailbox access

## Raw intake message

> Sarah needs access to support@ mailbox while Chris is away.

## Expected intake-agent behavior

### Clarification behavior
Clarification required.

### Ideal clarification transcript
**Bot:** Does Sarah need read access only, or send-as/send-on-behalf permissions too?

**Requester:** Read and reply, but not full send-as.

**Bot:** How long should the access last?

**Requester:** Through next Friday.

### Ideal intake-agent response after clarification
> Thanks — I’ll route temporary mailbox delegation for Sarah to support@ through next Friday with reply capability but not full send-as.

## Expected normalized `n8n` output

```json
{
  "source": "slack",
  "requester": "Sarah",
  "rawRequest": "Sarah needs access to support@ mailbox while Chris is away.",
  "normalizedType": "mailbox_access_request",
  "targetSystem": "email_system",
  "requestedEntitlement": "shared_mailbox_reply_access",
  "businessReason": "coverage while mailbox owner is away",
  "clarificationNeeded": false,
  "missingFields": [],
  "candidateWorkflows": ["mailbox_access_request"],
  "initialTrustMode": "human_approved_execution",
  "metadata": {
    "mailbox": "support@",
    "permissionScope": "read_and_reply_no_send_as",
    "duration": "through_next_friday"
  }
}
```

## Expected TrustPlane request snapshot summary

- **request title:** Mailbox Access Request · email_system
- **current state:** `awaiting_review`
- **current owner:** operator
- **workflow candidate:** `mailbox_access_request`
- **trust level:** `bounded`
- **policy decision:** held because mailbox delegation needs explicit review
- **pending action:** prepare mailbox delegation with restricted permission scope
- **verification expectation:** confirm delegation scope and duration
- **operator summary:** Temporary reply-capable mailbox delegation for Sarah to support@ through next Friday.

## Expected lifecycle posture

- `intake_received`
- `clarification_needed`
- `normalized`
- `admitted`
- `awaiting_review`

## Expected timeline events

1. `intake.request.received`
2. `intake.clarification.requested`
3. `intake.clarification.received`
4. `intake.request.normalized`
5. `intake.request.admitted`
6. `workflow.playbook.selected`
7. `policy.decision.changed`
8. `human.approval.requested`
9. `execution.change.prepared`

## Expected evidence artifacts

- mailbox delegation policy snapshot
- mailbox permission verification artifact
- duration/expiry audit artifact

## What this demonstrates

- permission-scope clarification
- temporary coverage access
- privacy-sensitive access handling

---

# Fixture 6 — Restart staging web service

## Raw intake message

> staging web is wedged again, can someone restart it?

## Expected intake-agent behavior

### Clarification behavior
Clarification required.

### Ideal clarification transcript
**Bot:** Which exact staging service should be restarted?

**Requester:** staging-web-api

**Bot:** Can you confirm this is staging only and not production?

**Requester:** Yes, staging only.

### Ideal intake-agent response after clarification
> Got it — I’ll route a restart request for the staging-web-api service in staging only.

## Expected normalized `n8n` output

```json
{
  "source": "slack",
  "requester": "unknown_requester",
  "rawRequest": "staging web is wedged again, can someone restart it?",
  "normalizedType": "service_restart_request",
  "targetSystem": "aws_staging",
  "requestedEntitlement": "restart_staging_web_api",
  "businessReason": "recover stalled staging web service",
  "clarificationNeeded": false,
  "missingFields": [],
  "candidateWorkflows": ["service_restart_request"],
  "initialTrustMode": "human_approved_execution",
  "metadata": {
    "serviceName": "staging-web-api",
    "environment": "staging"
  }
}
```

## Expected TrustPlane request snapshot summary

- **request title:** Service Restart Request · aws_staging
- **current state:** `awaiting_review`
- **current owner:** operator
- **workflow candidate:** `service_restart_request`
- **trust level:** `bounded`
- **policy decision:** held pending release of restart authority
- **pending action:** prepare service restart command envelope
- **verification expectation:** confirm service recovery and healthy status
- **operator summary:** Restart request for staging-web-api in staging after service stall.

## Expected lifecycle posture

- `intake_received`
- `clarification_needed`
- `normalized`
- `admitted`
- `awaiting_review`

## Expected timeline events

1. `intake.request.received`
2. `intake.clarification.requested`
3. `intake.clarification.received`
4. `intake.request.normalized`
5. `intake.request.admitted`
6. `workflow.playbook.selected`
7. `ownership.transferred`
8. `policy.decision.changed`
9. `human.approval.requested`
10. `execution.change.prepared`

## Expected evidence artifacts

- service restart policy snapshot
- restart execution log artifact
- health-check verification artifact

## What this demonstrates

- infra clarification without overcomplication
- bounded restart action
- staging vs production distinction

---

# Fixture 7 — Clean up unattached EBS volumes

## Raw intake message

> We should probably clean up those unattached EBS volumes in dev, they’ve been hanging around forever.

## Expected intake-agent behavior

### Clarification behavior
Clarification required.

### Ideal clarification transcript
**Bot:** Which AWS account and region should this cleanup target?

**Requester:** dev account, us-west-2.

**Bot:** What counts as safe to delete here?

**Requester:** Unattached for more than 30 days and not tagged keep.

### Ideal intake-agent response after clarification
> Thanks — I’ll route a reviewed cleanup request for unattached EBS volumes in dev/us-west-2 using the 30-day and no-keep-tag rule.

## Expected normalized `n8n` output

```json
{
  "source": "slack",
  "requester": "unknown_requester",
  "rawRequest": "We should probably clean up those unattached EBS volumes in dev, they’ve been hanging around forever.",
  "normalizedType": "cloud_cleanup_request",
  "targetSystem": "aws_ebs",
  "requestedEntitlement": "delete_unattached_volumes",
  "businessReason": "reduce stale resource cost in development environment",
  "clarificationNeeded": false,
  "missingFields": [],
  "candidateWorkflows": ["cloud_cleanup_reviewed"],
  "initialTrustMode": "human_approved_execution",
  "metadata": {
    "awsAccount": "dev",
    "region": "us-west-2",
    "safeDeleteCriteria": "unattached_gt_30_days_and_not_tagged_keep"
  }
}
```

## Expected TrustPlane request snapshot summary

- **request title:** Cloud Cleanup Request · aws_ebs
- **current state:** `awaiting_review`
- **current owner:** operator
- **workflow candidate:** `cloud_cleanup_reviewed`
- **trust level:** `bounded`
- **policy decision:** held because destructive cleanup criteria must be explicit
- **pending action:** prepare reviewed EBS cleanup plan
- **verification expectation:** confirm deleted set matches approved criteria only
- **operator summary:** Reviewed EBS cleanup request in dev/us-west-2 using explicit safe-delete criteria.

## Expected lifecycle posture

- `intake_received`
- `clarification_needed`
- `normalized`
- `admitted`
- `awaiting_review`

## Expected timeline events

1. `intake.request.received`
2. `intake.clarification.requested`
3. `intake.clarification.received`
4. `intake.request.normalized`
5. `intake.request.admitted`
6. `workflow.playbook.selected`
7. `policy.decision.changed`
8. `human.approval.requested`
9. `execution.change.prepared`

## Expected evidence artifacts

- cleanup policy snapshot
- candidate-resource review artifact
- deletion result verification artifact

## What this demonstrates

- destructive cleanup governance
- safe-delete criteria capture
- bounded cleanup planning

---

# Fixture 8 — Rotate or revoke stale IAM credential

## Raw intake message

> Looks like one of the old IAM users still has an active key. Can we revoke it and rotate if needed?

## Expected intake-agent behavior

### Clarification behavior
Clarification required.

### Ideal clarification transcript
**Bot:** Which IAM user or key are you referring to?

**Requester:** deploy-bot-old, key ending in 7KQ.

**Bot:** Which AWS account is this in?

**Requester:** staging shared services.

**Bot:** Do you want revoke-only, or revoke and issue a replacement?

**Requester:** Revoke only for now.

### Ideal intake-agent response after clarification
> Understood — I’ll route a revoke-only IAM credential request for deploy-bot-old in the staging shared-services account.

## Expected normalized `n8n` output

```json
{
  "source": "slack",
  "requester": "unknown_requester",
  "rawRequest": "Looks like one of the old IAM users still has an active key. Can we revoke it and rotate if needed?",
  "normalizedType": "credential_rotation_request",
  "targetSystem": "aws_iam",
  "requestedEntitlement": "revoke_access_key",
  "businessReason": "remove stale IAM credential exposure",
  "clarificationNeeded": false,
  "missingFields": [],
  "candidateWorkflows": ["credential_revoke_or_rotate"],
  "initialTrustMode": "human_approved_execution",
  "metadata": {
    "iamUser": "deploy-bot-old",
    "keySuffix": "7KQ",
    "accountScope": "staging_shared_services",
    "actionDecision": "revoke_only"
  }
}
```

## Expected TrustPlane request snapshot summary

- **request title:** Credential Rotation Request · aws_iam
- **current state:** `awaiting_review`
- **current owner:** operator
- **workflow candidate:** `credential_revoke_or_rotate`
- **trust level:** `bounded`
- **policy decision:** held because credential actions are security-sensitive
- **pending action:** prepare IAM key revocation action
- **verification expectation:** confirm target key disabled/revoked and no unintended replacement issued
- **operator summary:** Revoke-only IAM credential hygiene request for deploy-bot-old in staging shared services.

## Expected lifecycle posture

- `intake_received`
- `clarification_needed`
- `normalized`
- `admitted`
- `awaiting_review`

## Expected timeline events

1. `intake.request.received`
2. `intake.clarification.requested`
3. `intake.clarification.received`
4. `intake.request.normalized`
5. `intake.request.admitted`
6. `workflow.playbook.selected`
7. `policy.decision.changed`
8. `human.approval.requested`
9. `execution.change.prepared`

## Expected evidence artifacts

- IAM credential policy snapshot
- target-key identification artifact
- revocation verification artifact

## What this demonstrates

- security-sensitive credential hygiene
- revoke-vs-rotate distinction
- exact-scope clarification

---

# Fixture 9 — Investigate CPU spike on production instance

## Raw intake message

> prod api cpu is pinned on one node, can someone take a look?

## Expected intake-agent behavior

### Clarification behavior
Clarification required.

### Ideal clarification transcript
**Bot:** Which service or instance group is affected?

**Requester:** prod-api ASG, one node in us-west-2.

**Bot:** Is this request for investigation only, or is restart/remediation already authorized if needed?

**Requester:** Investigation only for now.

### Ideal intake-agent response after clarification
> Got it — I’ll route a production investigation request for the prod-api ASG in us-west-2 with investigation-only scope.

## Expected normalized `n8n` output

```json
{
  "source": "slack",
  "requester": "unknown_requester",
  "rawRequest": "prod api cpu is pinned on one node, can someone take a look?",
  "normalizedType": "incident_triage_request",
  "targetSystem": "aws_production",
  "requestedEntitlement": "investigate_high_cpu",
  "businessReason": "investigate production performance degradation",
  "clarificationNeeded": false,
  "missingFields": [],
  "candidateWorkflows": ["incident_triage_investigate_only"],
  "initialTrustMode": "observe_and_escalate",
  "metadata": {
    "serviceIdentifier": "prod-api-asg",
    "region": "us-west-2",
    "authorizedActionScope": "investigation_only"
  }
}
```

## Expected TrustPlane request snapshot summary

- **request title:** Incident Triage Request · aws_production
- **current state:** `awaiting_review` or tightly held investigate-only posture
- **current owner:** operator
- **workflow candidate:** `incident_triage_investigate_only`
- **trust level:** `observed` or restrictive investigate-first posture
- **policy decision:** allow investigation preparation, hold remediation execution
- **pending action:** investigation-only access/inspection plan
- **verification expectation:** collect diagnostic artifact rather than immediate change verification
- **operator summary:** Production CPU investigation request for prod-api ASG with investigation-only authority.

## Expected lifecycle posture

- `intake_received`
- `clarification_needed`
- `normalized`
- `admitted`
- `awaiting_review`

## Expected timeline events

1. `intake.request.received`
2. `intake.clarification.requested`
3. `intake.clarification.received`
4. `intake.request.normalized`
5. `intake.request.admitted`
6. `workflow.playbook.selected`
7. `policy.decision.changed`
8. `human.approval.requested`
9. `execution.change.prepared`

## Expected evidence artifacts

- production investigation policy snapshot
- diagnostic artifact or metrics snapshot
- investigation summary artifact

## What this demonstrates

- production investigation without premature execution
- distinction between diagnosis and remediation
- restrictive trust posture for prod

---

# Fixture 10 — Restart failed staging worker

## Raw intake message

> The background invoice worker in staging stopped processing jobs again. Please restart it.

## Expected intake-agent behavior

### Clarification behavior
Minimal clarification, only if there are multiple candidate workers.
Otherwise proceed.

### Ideal intake-agent response
> Understood — I’ll route a staging restart request for the invoice worker.

## Expected normalized `n8n` output

```json
{
  "source": "slack",
  "requester": "unknown_requester",
  "rawRequest": "The background invoice worker in staging stopped processing jobs again. Please restart it.",
  "normalizedType": "service_restart_request",
  "targetSystem": "aws_staging",
  "requestedEntitlement": "restart_invoice_worker",
  "businessReason": "restore stalled background job processing in staging",
  "clarificationNeeded": false,
  "missingFields": [],
  "candidateWorkflows": ["staging_worker_recovery"],
  "initialTrustMode": "human_approved_execution",
  "metadata": {
    "serviceName": "invoice_worker",
    "environment": "staging"
  }
}
```

## Expected TrustPlane request snapshot summary

- **request title:** Service Restart Request · aws_staging
- **current state:** `awaiting_review`
- **current owner:** operator
- **workflow candidate:** `staging_worker_recovery`
- **trust level:** `bounded`
- **policy decision:** held pending release of restart authority
- **pending action:** prepare worker restart envelope
- **verification expectation:** confirm queue processing resumes after restart
- **operator summary:** Staging invoice-worker restart request after stalled queue processing.

## Expected lifecycle posture

- `intake_received`
- `normalized`
- `admitted`
- `awaiting_review`

## Expected timeline events

1. `intake.request.received`
2. `intake.request.normalized`
3. `intake.request.admitted`
4. `workflow.playbook.selected`
5. `ownership.transferred`
6. `policy.decision.changed`
7. `human.approval.requested`
8. `execution.change.prepared`

## Expected evidence artifacts

- restart policy snapshot
- worker restart execution log
- queue recovery verification artifact

## What this demonstrates

- straightforward bounded ops request
- low-friction staging restart flow
- good contrast with the production investigation example

---

# What this fixture pack demonstrates overall

This set should help demonstrate:

- governed conversational intake design
- structured clarification rather than noisy over-questioning
- normalization from messy human requests into durable intake objects
- workflow candidacy and trust-posture selection
- how TrustPlane turns intake into an operator-facing governed record
- a believable range of operational use cases across IT and AWS/ops work

## Fixture quality bar

A strong intake fixture should:

- use realistic human phrasing
- capture only materially needed clarification
- normalize into canonical field/value shapes
- assign a workflow family that matches the request class
- choose an initial trust posture with operational meaning
- distinguish investigation-only from execute-authorized requests
- include expected evidence, not just expected action

## Execution readiness note

These 10 fixtures are not all equally suitable for immediate real execution.

A practical near-term split is:

### Stronger near-term execution candidates

- reporting dashboard access
- finance shared drive access
- shared mailbox access
- staging web restart
- staging worker restart

### Better as governed-but-more-controlled execution later

- contractor VPN access
- offboarding access removal
- EBS cleanup
- IAM credential revoke

### Better treated as investigation-first rather than direct execution

- production CPU investigation

The intended outcome is not that every fixture becomes an immediate execute-now path.
The intended outcome is that all fixtures can be governed well, while only the bounded ones move quickly toward actual execution wiring.

## Strong next extensions

If you want to push this further later, the next strongest additions would be:

1. fixture JSON files checked into a test directory
2. expected TrustPlane timeline fixtures in machine-readable form
3. a short trust-posture appendix explaining why each example gets its initial mode
4. one or two narrated demo scripts built from these fixtures
