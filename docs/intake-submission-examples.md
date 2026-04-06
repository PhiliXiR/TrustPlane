# Intake Submission Examples

## Purpose

This document provides a curated set of realistic intake submissions for the implemented intake-bot -> watcher -> `n8n` -> TrustPlane path.

These examples are meant to help with:

- intake-bot prompt and behavior tuning
- normalization testing
- clarification-loop testing
- candidate workflow selection
- initial trust posture assignment
- TrustPlane operator-surface testing
- demo and regression fixtures

The examples are intentionally mixed.
Some are clean and complete.
Some are vague or incomplete.
Some are low-ish risk.
Some are moderate or high enough that stronger review posture makes sense.

## Suggested use

Each example includes:

1. raw intake message
2. clarification needs
3. normalized intake object
4. candidate workflow(s)
5. initial trust mode
6. notes on why that trust posture makes sense

These should be treated as reference fixtures, not as the only acceptable shapes.

---

# Set A — IT / account / VPN examples

## Example 1 — Reporting dashboard access request

### Raw intake message

> Hey, can someone give Jamie access to the reporting dashboard? They’re helping with the Monday metrics review.

### Clarification needed?

No, assuming Jamie’s identity can be resolved from directory context.

### Normalized intake object

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

### Why this trust mode?

- standard access request
- moderate business impact
- low ambiguity
- still should be gated by approval before execution

---

## Example 2 — Add user to finance shared drive

### Raw intake message

> Need Priya added to the Finance shared drive for month-end close.

### Clarification needed?

Yes.
Likely missing:
- exact shared drive/group name
- duration or permanence of access
- confirmation Priya is the intended identity

### Suggested clarification questions

- Which exact Finance shared drive or Google group should Priya be added to?
- Is this temporary access for month-end close or ongoing access?

### Normalized intake object

```json
{
  "source": "slack",
  "requester": "Priya",
  "rawRequest": "Need Priya added to the Finance shared drive for month-end close.",
  "normalizedType": "access_request",
  "targetSystem": "google_workspace",
  "requestedEntitlement": "finance_shared_drive_access",
  "businessReason": "month-end close",
  "clarificationNeeded": true,
  "missingFields": ["exact_resource_name", "access_duration"],
  "candidateWorkflows": ["access_request_standard", "shared_drive_access"],
  "initialTrustMode": "clarify_then_route"
}
```

### Why this trust mode?

- request is understandable but incomplete
- resource scope is unclear
- temporary vs permanent access matters

---

## Example 3 — VPN access for contractor

### Raw intake message

> Can we get VPN access set up for the new contractor starting tomorrow? Name is Alex, working with infra for two weeks.

### Clarification needed?

Yes.
Likely missing:
- contractor identity details
- which VPN profile or network segment
- sponsoring manager / approver
- exact access window end date

### Suggested clarification questions

- Which Alex is this, and what is their directory/email identity?
- Which VPN profile or internal network segment do they need?
- Who is sponsoring/approving this contractor access?

### Normalized intake object

```json
{
  "source": "slack",
  "requester": "Alex",
  "rawRequest": "Can we get VPN access set up for the new contractor starting tomorrow? Name is Alex, working with infra for two weeks.",
  "normalizedType": "vpn_access_request",
  "targetSystem": "corporate_vpn",
  "requestedEntitlement": "vpn.contractor",
  "businessReason": "infra contractor onboarding for two-week engagement",
  "clarificationNeeded": true,
  "missingFields": ["directory_identity", "vpn_profile", "approving_manager"],
  "candidateWorkflows": ["vpn_access_request", "contractor_access_request"],
  "initialTrustMode": "clarify_then_route"
}
```

### Why this trust mode?

- contractor + VPN is riskier than a basic internal app access request
- identity and scope must be resolved first

---

## Example 4 — Remove old employee VPN and group access

### Raw intake message

> Please remove Morgan’s VPN and internal group access today — they left Friday.

### Clarification needed?

Maybe minimal clarification.
Likely enough to route if Morgan’s identity is resolvable.
Could still confirm exact systems if removal should be broader than VPN/groups.

### Normalized intake object

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

### Why this trust mode?

- deprovisioning is usually desirable and lower-risk than granting new access
- still deserves review because scope mistakes are possible

---

## Example 5 — Shared mailbox access

### Raw intake message

> Sarah needs access to support@ mailbox while Chris is away.

### Clarification needed?

Yes.
Likely missing:
- email system/provider
- read-only vs send-as vs full mailbox delegation
- access duration

### Suggested clarification questions

- Does Sarah need read access only, or send-as/send-on-behalf permissions too?
- How long should this mailbox access last?

### Normalized intake object

```json
{
  "source": "slack",
  "requester": "Sarah",
  "rawRequest": "Sarah needs access to support@ mailbox while Chris is away.",
  "normalizedType": "mailbox_access_request",
  "targetSystem": "email_system",
  "requestedEntitlement": "shared_mailbox_access",
  "businessReason": "coverage while mailbox owner is away",
  "clarificationNeeded": true,
  "missingFields": ["permission_scope", "access_duration"],
  "candidateWorkflows": ["mailbox_access_request", "temporary_coverage_access"],
  "initialTrustMode": "clarify_then_route"
}
```

### Why this trust mode?

- mailbox delegation can have meaningful privacy and impersonation implications
- permission scope matters a lot

---

# Set B — AWS / infra / ops examples

## Example 6 — Restart staging web service

### Raw intake message

> staging web is wedged again, can someone restart it?

### Clarification needed?

Yes, a little.
Likely missing:
- exact service/app name
- environment confirmation
- whether there is an incident/ticket reference

### Suggested clarification questions

- Which exact staging service should be restarted?
- Can you confirm this is staging and not production?

### Normalized intake object

```json
{
  "source": "slack",
  "requester": "unknown_requester",
  "rawRequest": "staging web is wedged again, can someone restart it?",
  "normalizedType": "service_restart_request",
  "targetSystem": "aws_staging",
  "requestedEntitlement": "restart_service",
  "businessReason": "recover stalled staging web service",
  "clarificationNeeded": true,
  "missingFields": ["service_name", "environment_confirmation"],
  "candidateWorkflows": ["service_restart", "staging_recovery_action"],
  "initialTrustMode": "clarify_then_route"
}
```

### Why this trust mode?

- action is operationally straightforward
- but wrong target/environment would be a bad mistake

---

## Example 7 — Clean up unattached EBS volumes

### Raw intake message

> We should probably clean up those unattached EBS volumes in dev, they’ve been hanging around forever.

### Clarification needed?

Yes.
Likely missing:
- exact account/project
- exact region(s)
- confirmation of safe deletion criteria

### Suggested clarification questions

- Which AWS account and region should this cleanup target?
- What criteria should define “safe to delete” for unattached volumes?

### Normalized intake object

```json
{
  "source": "slack",
  "requester": "unknown_requester",
  "rawRequest": "We should probably clean up those unattached EBS volumes in dev, they’ve been hanging around forever.",
  "normalizedType": "cloud_cleanup_request",
  "targetSystem": "aws_ebs",
  "requestedEntitlement": "delete_unattached_volumes",
  "businessReason": "reduce stale resource cost in development environment",
  "clarificationNeeded": true,
  "missingFields": ["aws_account", "region", "deletion_criteria"],
  "candidateWorkflows": ["aws_cleanup_reviewed", "ebs_cleanup"],
  "initialTrustMode": "clarify_then_route"
}
```

### Why this trust mode?

- cleanup sounds simple, but accidental deletion is real risk
- needs explicit scope and safe-delete conditions

---

## Example 8 — Rotate or revoke stale IAM credential

### Raw intake message

> Looks like one of the old IAM users still has an active key. Can we revoke it and rotate if needed?

### Clarification needed?

Yes.
Likely missing:
- exact IAM user or access key
- whether account is still in legitimate use
- which environment/account this applies to

### Suggested clarification questions

- Which IAM user or key are you referring to?
- Is this production, staging, or a sandbox account?
- Should this be revoke-only, or revoke + new key issuance?

### Normalized intake object

```json
{
  "source": "slack",
  "requester": "unknown_requester",
  "rawRequest": "Looks like one of the old IAM users still has an active key. Can we revoke it and rotate if needed?",
  "normalizedType": "credential_rotation_request",
  "targetSystem": "aws_iam",
  "requestedEntitlement": "revoke_or_rotate_access_key",
  "businessReason": "remove stale IAM credential exposure",
  "clarificationNeeded": true,
  "missingFields": ["iam_user_or_key_id", "account_scope", "rotation_or_revoke_decision"],
  "candidateWorkflows": ["credential_revoke_or_rotate", "iam_key_hygiene"],
  "initialTrustMode": "clarify_then_route"
}
```

### Why this trust mode?

- security-sensitive
- strongly benefits from exact scope before action

---

## Example 9 — Investigate CPU spike on production instance

### Raw intake message

> prod api cpu is pinned on one node, can someone take a look?

### Clarification needed?

Yes, but this may be a triage/investigation workflow rather than a direct change request.
Likely missing:
- exact service / instance / ASG
- account/region
- whether any action beyond investigation is authorized

### Normalized intake object

```json
{
  "source": "slack",
  "requester": "unknown_requester",
  "rawRequest": "prod api cpu is pinned on one node, can someone take a look?",
  "normalizedType": "incident_triage_request",
  "targetSystem": "aws_production",
  "requestedEntitlement": "investigate_high_cpu",
  "businessReason": "investigate production performance degradation",
  "clarificationNeeded": true,
  "missingFields": ["service_identifier", "instance_or_group", "authorized_action_scope"],
  "candidateWorkflows": ["incident_triage_investigate_only", "prod_runtime_investigation"],
  "initialTrustMode": "observe_and_escalate"
}
```

### Why this trust mode?

- production environment
- not yet a clear execution request
- investigation may be okay before remediation, but change authority should stay tight

---

## Example 10 — Restart failed worker / queue processor

### Raw intake message

> The background invoice worker in staging stopped processing jobs again. Please restart it.

### Clarification needed?

Probably not much if the service identity is already well known.
Could still confirm exact service name if there are multiple workers.

### Normalized intake object

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
  "initialTrustMode": "human_approved_execution"
}
```

### Why this trust mode?

- staging environment lowers risk somewhat
- restart action is bounded and common
- still benefits from an explicit approval/release boundary

---

# Notes on variation

This set intentionally spans:

- clean requests
- vague requests
- clarification-heavy requests
- identity/access tasks
- deprovisioning/cleanup tasks
- cloud hygiene tasks
- operational restart tasks
- investigation-only requests
- staging vs production contexts

That variety is useful because the intake bot should not behave the same way for all of them.

## Good behaviors these examples should test

- ask for clarification only when materially needed
- preserve the raw request faithfully
- assign sensible workflow candidates
- distinguish investigation from execution
- distinguish low/moderate risk from higher-risk requests
- avoid over-claiming confidence when scope is unclear
- make initial trust posture reflect both ambiguity and risk

## Possible next extension

A good follow-up would be to add for each example:

- expected intake-bot clarification transcript
- expected `n8n` normalized output shape
- expected TrustPlane request snapshot summary
- expected operator timeline events

That would turn this from a useful examples doc into a stronger regression/test-fixture pack.
