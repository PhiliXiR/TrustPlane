# Minimal Operator Team

## Purpose

This document defines a very small operator team that could eventually be deployed as real governed agents instead of staying as abstract role names.

The goal is to keep the team small enough to be believable and useful.

## Team design goals

The team should be able to cover:

- request intake
- access requests
- endpoint/support workflows
- higher-risk infrastructure or policy changes
- human approvals and takeover points

## Team roster

### 1. Intake Agent

**Primary responsibility:**

- conversational intake
- clarification
- request normalization
- workflow candidacy
- routing handoff

**Should not own:**

- risky execution
- final approval authority
- uncontrolled direct tool execution

### 2. Access Operator

**Primary responsibility:**

- application access requests
- entitlement grants/removals
- group membership updates
- access verification

**Typical workflows:**

- reporting app access
- repository access
- shared SaaS entitlements

### 3. Endpoint Operator

**Primary responsibility:**

- endpoint support workflows
- device compliance checks
- approved software install/reinstall
- VPN and workstation troubleshooting
- user-side evidence gathering

**Typical workflows:**

- VPN not connecting
- reinstall approved client software
- compliance drift remediation guidance

### 4. Change Operator

**Primary responsibility:**

- staged infrastructure or policy changes
- maintenance-window work
- rollback-aware change planning
- operator-visible high-risk workflows

**Typical workflows:**

- VPN policy update
- firewall rule adjustment
- governed infrastructure change

### 5. Human Approver / Duty Operator

**Primary responsibility:**

- approval checkpoints
- deny/pause/takeover actions
- final authority on risky workflows
- intervention when trust falls or verification fails

This is not just a cosmetic role.
It is part of the real control model.

## Deployment-oriented structure

Each operator should eventually have:

- a dedicated workspace
- a runtime config entry
- explicit tool permissions
- an identity
- a narrow workflow scope

## Example agent inventory

```json5
{
  agents: {
    list: [
      {
        id: "intake",
        name: "Intake Agent",
        workspace: "~/.openclaw/workspaces/intake-agent"
      },
      {
        id: "access-operator",
        name: "Access Operator",
        workspace: "~/.openclaw/workspaces/access-operator"
      },
      {
        id: "endpoint-operator",
        name: "Endpoint Operator",
        workspace: "~/.openclaw/workspaces/endpoint-operator"
      },
      {
        id: "change-operator",
        name: "Change Operator",
        workspace: "~/.openclaw/workspaces/change-operator"
      }
    ]
  }
}
```

A human approver may remain outside the runtime as a real human checkpoint rather than a normal agent entry.

## Suggested ownership boundaries

### Intake Agent

Can:

- ask questions
- classify
- normalize
- route

Cannot:

- execute risky changes
- self-approve

### Access Operator

Can:

- prepare access changes
- execute bounded low-risk access workflows when policy permits
- verify resulting entitlement state

Cannot:

- approve its own sensitive access requests when policy requires separation

### Endpoint Operator

Can:

- drive support troubleshooting playbooks
- stage remediations
- execute bounded support actions if policy allows

Cannot:

- perform unrelated infrastructure changes

### Change Operator

Can:

- prepare and stage risky changes
- assemble rollback and verification steps
- surface blast-radius and trust boundaries

Cannot:

- silently execute high-risk changes without the required control path

## Why this roster works

This is small enough to avoid fake organizational sprawl.

It still covers the important practical lanes:

- intake
- access
- endpoint support
- higher-risk change work
- human approval

That is enough to support realistic demos, runtime contracts, and eventual deployment design.

## TrustPlane implications

TrustPlane should be able to show for each request:

- current owner
- eligible operator lane
- selected workflow
- trust level
- delegation mode
- execution mode
- human checkpoint status
- verification status

That means the operator team is not just narrative structure.
It is part of the visible control model.

## Suggested next implementation step

After defining the team, the next useful step would be to represent these operators in runtime-shaped data with:

- explicit ownership transitions
- handoff events
- approval checkpoints
- execution envelopes

That would let the frontend show a believable governed team instead of static labels.

## Summary

The minimal realistic team is:

- Intake Agent
- Access Operator
- Endpoint Operator
- Change Operator
- Human Approver / Duty Operator

That is small, legible, and deployable enough to matter.
