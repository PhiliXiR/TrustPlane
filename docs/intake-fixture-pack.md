# Intake Fixture Pack

## Purpose

This document expands the curated intake submissions into full fixture-style examples for the implemented intake-bot -> watcher -> `n8n` -> TrustPlane path.

These examples are meant to be useful for:

- demos
- intake-bot prompt tuning
- `n8n` normalization validation
- TrustPlane operator-surface testing
- future regression fixture design

Each fixture includes:

1. raw intake message
2. expected clarification behavior
3. expected normalized `n8n` output
4. expected TrustPlane request snapshot summary
5. expected timeline events
6. notes on what the example demonstrates

These are written to be readable by humans first while still being structured enough to guide future testing.

---

# Fixture 1 — Reporting dashboard access request

## Raw intake message

> Hey, can someone give Jamie access to the reporting dashboard? They’re helping with the Monday metrics review.

## Expected intake-bot behavior

### Clarification behavior
No clarification required if Jamie’s identity is resolvable through the identity provider.

### Ideal intake-bot response
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
  "candidateWorkflows": ["access_request_standard", "reporting_access"],
  "initialTrustMode": "human_approved_execution"
}
```

## Expected TrustPlane request snapshot summary

- **request title:** Access Request · reporting_dashboard
- **current state:** Received from intake and awaiting governed review
- **current owner:** Access Operator
- **workflow candidate:** access_request_standard or reporting_access
- **trust level:** moderate / bounded-human-approved
- **policy decision:** held pending human approval
- **pending action:** prepared access grant for reporting.read
- **verification expectation:** confirm final entitlement state

## Expected timeline events

1. `intake.request.received`
2. `intake.request.normalized`
3. `workflow.playbook.selected`
4. `ownership.transferred`
5. `policy.decision.changed`
6. `human.approval.requested`

## What this demonstrates

- clean low-ambiguity intake
- access-request normalization
- straightforward governed routing
- approval-gated moderate-risk request

---

# Fixture 2 — Add user to finance shared drive

## Raw intake message

> Need Priya added to the Finance shared drive for month-end close.

## Expected intake-bot behavior

### Clarification behavior
Clarification required.

### Ideal clarification transcript
**Bot:** Which exact Finance shared drive or group should Priya be added to?

**Requester:** The Finance Close shared drive.

**Bot:** Is this temporary access for month-end close or should it remain ongoing?

**Requester:** Temporary for this week only.

### Ideal intake-bot response after clarification
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
  "candidateWorkflows": ["access_request_standard", "shared_drive_access", "temporary_access_request"],
  "initialTrustMode": "human_approved_execution",
  "metadata": {
    "resourceName": "Finance Close shared drive",
    "duration": "temporary_this_week"
  }
}
```

## Expected TrustPlane request snapshot summary

- **request title:** Access Request · google_workspace
- **current state:** Received from intake and awaiting governed review
- **current owner:** Access Operator
- **workflow candidate:** shared_drive_access
- **trust level:** moderate / bounded-human-approved
- **policy decision:** held pending review because resource access is temporary but sensitive
- **pending action:** prepare shared-drive membership grant with duration note
- **verification expectation:** confirm group/drive membership applied and duration recorded

## Expected timeline events

1. `intake.request.received`
2. `intake.clarification.requested`
3. `intake.clarification.received`
4. `intake.request.normalized`
5. `workflow.playbook.selected`
6. `ownership.transferred`
7. `policy.decision.changed`
8. `human.approval.requested`

## What this demonstrates

- clarification loop quality
- resource-scope capture
- temporary access semantics
- TrustPlane handling of clarified request progression

---

# Fixture 3 — VPN access for contractor

## Raw intake message

> Can we get VPN access set up for the new contractor starting tomorrow? Name is Alex, working with infra for two weeks.

## Expected intake-bot behavior

### Clarification behavior
Clarification required.

### Ideal clarification transcript
**Bot:** Which Alex is this? I need the contractor’s email or directory identity.

**Requester:** alex.rivera.contractor@vendorco.com

**Bot:** Which VPN profile or internal network segment should Alex receive access to?

**Requester:** Infra contractor VPN profile only.

**Bot:** Who is the approving manager for this contractor access?

**Requester:** Dana approved it.

### Ideal intake-bot response after clarification
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
  "candidateWorkflows": ["vpn_access_request", "contractor_access_request"],
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

- **request title:** Vpn Access Request · corporate_vpn
- **current state:** Received from intake and awaiting governed review
- **current owner:** Access Operator
- **workflow candidate:** vpn_access_request
- **trust level:** moderate but tightly gated
- **policy decision:** held because contractor VPN access requires explicit review
- **pending action:** prepare contractor VPN profile assignment
- **verification expectation:** confirm VPN profile and expiration window

## Expected timeline events

1. `intake.request.received`
2. `intake.clarification.requested`
3. `intake.clarification.received`
4. `intake.request.normalized`
5. `workflow.playbook.selected`
6. `policy.decision.changed`
7. `human.approval.requested`

## What this demonstrates

- higher-sensitivity access handling
- contractor identity resolution
- sponsor capture
- duration-limited access semantics

---

# Fixture 4 — Remove former employee VPN and group access

## Raw intake message

> Please remove Morgan’s VPN and internal group access today — they left Friday.

## Expected intake-bot behavior

### Clarification behavior
Minimal clarification only if Morgan cannot be resolved.
Otherwise proceed directly.

### Ideal intake-bot response
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
  "candidateWorkflows": ["offboarding_access_removal", "deprovision_standard"],
  "initialTrustMode": "human_approved_execution"
}
```

## Expected TrustPlane request snapshot summary

- **request title:** Deprovision Request · identity_and_access
- **current state:** Received from intake and awaiting governed review
- **current owner:** Access Operator
- **workflow candidate:** offboarding_access_removal
- **trust level:** bounded, likely lower controversy than new-access grant
- **policy decision:** held for confirmation/review
- **pending action:** prepare access-removal changes
- **verification expectation:** confirm VPN access removed and target groups removed

## Expected timeline events

1. `intake.request.received`
2. `intake.request.normalized`
3. `workflow.playbook.selected`
4. `ownership.transferred`
5. `policy.decision.changed`
6. `human.approval.requested`

## What this demonstrates

- deprovisioning flow
- lower-risk-but-still-governed access removal
- offboarding posture

---

# Fixture 5 — Shared mailbox access

## Raw intake message

> Sarah needs access to support@ mailbox while Chris is away.

## Expected intake-bot behavior

### Clarification behavior
Clarification required.

### Ideal clarification transcript
**Bot:** Does Sarah need read access only, or send-as/send-on-behalf permissions too?

**Requester:** Read and reply, but not full send-as.

**Bot:** How long should the access last?

**Requester:** Through next Friday.

### Ideal intake-bot response after clarification
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
  "candidateWorkflows": ["mailbox_access_request", "temporary_coverage_access"],
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
- **current state:** Received from intake and awaiting governed review
- **current owner:** Access Operator
- **workflow candidate:** mailbox_access_request
- **trust level:** moderate and privacy-sensitive
- **policy decision:** held because mailbox delegation needs explicit review
- **pending action:** prepare mailbox delegation with restricted permission scope
- **verification expectation:** confirm delegation scope and duration

## Expected timeline events

1. `intake.request.received`
2. `intake.clarification.requested`
3. `intake.clarification.received`
4. `intake.request.normalized`
5. `workflow.playbook.selected`
6. `policy.decision.changed`
7. `human.approval.requested`

## What this demonstrates

- permission-scope clarification
- temporary coverage access
- privacy-sensitive access handling

---

# Fixture 6 — Restart staging web service

## Raw intake message

> staging web is wedged again, can someone restart it?

## Expected intake-bot behavior

### Clarification behavior
Clarification required.

### Ideal clarification transcript
**Bot:** Which exact staging service should be restarted?

**Requester:** staging-web-api

**Bot:** Can you confirm this is staging only and not production?

**Requester:** Yes, staging only.

### Ideal intake-bot response after clarification
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
  "candidateWorkflows": ["service_restart", "staging_recovery_action"],
  "initialTrustMode": "human_approved_execution",
  "metadata": {
    "serviceName": "staging-web-api",
    "environment": "staging"
  }
}
```

## Expected TrustPlane request snapshot summary

- **request title:** Service Restart Request · aws_staging
- **current state:** Received from intake and awaiting governed review
- **current owner:** Change Operator
- **workflow candidate:** service_restart
- **trust level:** bounded, moderate risk
- **policy decision:** held pending release of restart authority
- **pending action:** prepare service restart command envelope
- **verification expectation:** confirm service recovery and healthy status

## Expected timeline events

1. `intake.request.received`
2. `intake.clarification.requested`
3. `intake.clarification.received`
4. `intake.request.normalized`
5. `workflow.playbook.selected`
6. `ownership.transferred`
7. `human.approval.requested`

## What this demonstrates

- infra clarification without overcomplication
- bounded restart action
- staging vs production distinction

---

# Fixture 7 — Clean up unattached EBS volumes

## Raw intake message

> We should probably clean up those unattached EBS volumes in dev, they’ve been hanging around forever.

## Expected intake-bot behavior

### Clarification behavior
Clarification required.

### Ideal clarification transcript
**Bot:** Which AWS account and region should this cleanup target?

**Requester:** dev account, us-west-2.

**Bot:** What counts as safe to delete here?

**Requester:** Unattached for more than 30 days and not tagged keep.

### Ideal intake-bot response after clarification
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
  "candidateWorkflows": ["aws_cleanup_reviewed", "ebs_cleanup"],
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
- **current state:** Received from intake and awaiting governed review
- **current owner:** Change Operator
- **workflow candidate:** aws_cleanup_reviewed
- **trust level:** bounded / review-heavy
- **policy decision:** held because destructive cleanup criteria must be explicit
- **pending action:** prepare reviewed EBS cleanup plan
- **verification expectation:** confirm deleted set matches approved criteria only

## Expected timeline events

1. `intake.request.received`
2. `intake.clarification.requested`
3. `intake.clarification.received`
4. `intake.request.normalized`
5. `workflow.playbook.selected`
6. `policy.decision.changed`
7. `human.approval.requested`

## What this demonstrates

- destructive cleanup governance
- safe-delete criteria capture
- bounded cleanup planning

---

# Fixture 8 — Rotate or revoke stale IAM credential

## Raw intake message

> Looks like one of the old IAM users still has an active key. Can we revoke it and rotate if needed?

## Expected intake-bot behavior

### Clarification behavior
Clarification required.

### Ideal clarification transcript
**Bot:** Which IAM user or key are you referring to?

**Requester:** deploy-bot-old, key ending in 7KQ.

**Bot:** Which AWS account is this in?

**Requester:** staging shared services.

**Bot:** Do you want revoke-only, or revoke and issue a replacement?

**Requester:** Revoke only for now.

### Ideal intake-bot response after clarification
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
  "candidateWorkflows": ["credential_revoke_or_rotate", "iam_key_hygiene"],
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
- **current state:** Received from intake and awaiting governed review
- **current owner:** Change Operator
- **workflow candidate:** credential_revoke_or_rotate
- **trust level:** moderate/high sensitivity, bounded by approval
- **policy decision:** held because credential actions are security-sensitive
- **pending action:** prepare IAM key revocation action
- **verification expectation:** confirm target key disabled/revoked and no unintended replacement issued

## Expected timeline events

1. `intake.request.received`
2. `intake.clarification.requested`
3. `intake.clarification.received`
4. `intake.request.normalized`
5. `workflow.playbook.selected`
6. `policy.decision.changed`
7. `human.approval.requested`

## What this demonstrates

- security-sensitive credential hygiene
- revoke-vs-rotate distinction
- exact-scope clarification

---

# Fixture 9 — Investigate CPU spike on production instance

## Raw intake message

> prod api cpu is pinned on one node, can someone take a look?

## Expected intake-bot behavior

### Clarification behavior
Clarification required.

### Ideal clarification transcript
**Bot:** Which service or instance group is affected?

**Requester:** prod-api ASG, one node in us-west-2.

**Bot:** Is this request for investigation only, or is restart/remediation already authorized if needed?

**Requester:** Investigation only for now.

### Ideal intake-bot response after clarification
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
  "candidateWorkflows": ["incident_triage_investigate_only", "prod_runtime_investigation"],
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
- **current state:** Received from intake and awaiting governed review
- **current owner:** Change Operator or incident operator
- **workflow candidate:** incident_triage_investigate_only
- **trust level:** restrictive / observe-first
- **policy decision:** allow investigation preparation, hold remediation execution
- **pending action:** investigation-only access/inspection plan
- **verification expectation:** collect diagnostic artifact rather than immediate change verification

## Expected timeline events

1. `intake.request.received`
2. `intake.clarification.requested`
3. `intake.clarification.received`
4. `intake.request.normalized`
5. `workflow.playbook.selected`
6. `policy.decision.changed`
7. `human.approval.requested` or `workflow.state.changed` into investigate-only posture

## What this demonstrates

- production investigation without premature execution
- distinction between diagnosis and remediation
- restrictive trust posture for prod

---

# Fixture 10 — Restart failed staging worker

## Raw intake message

> The background invoice worker in staging stopped processing jobs again. Please restart it.

## Expected intake-bot behavior

### Clarification behavior
Minimal clarification, only if there are multiple candidate workers.
Otherwise proceed.

### Ideal intake-bot response
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
  "candidateWorkflows": ["service_restart", "staging_worker_recovery"],
  "initialTrustMode": "human_approved_execution",
  "metadata": {
    "serviceName": "invoice_worker",
    "environment": "staging"
  }
}
```

## Expected TrustPlane request snapshot summary

- **request title:** Service Restart Request · aws_staging
- **current state:** Received from intake and awaiting governed review
- **current owner:** Change Operator
- **workflow candidate:** staging_worker_recovery
- **trust level:** bounded-human-approved
- **policy decision:** held pending release of restart authority
- **pending action:** prepare worker restart envelope
- **verification expectation:** confirm queue processing resumes after restart

## Expected timeline events

1. `intake.request.received`
2. `intake.request.normalized`
3. `workflow.playbook.selected`
4. `ownership.transferred`
5. `policy.decision.changed`
6. `human.approval.requested`

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

## Strong next extensions

If you want to push this further later, the next strongest additions would be:

1. fixture JSON files checked into a test directory
2. expected TrustPlane timeline fixtures in machine-readable form
3. one or two fully narrated demo scripts using these fixtures
4. a short appendix explaining how trust posture differs between the examples
