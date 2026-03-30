# Operator Agent Runtime Contract

## Purpose

This document extends the TrustPlane runtime contract so operator agents become first-class actors instead of static labels.

The goal is to support the real TrustPlane vision where:

- NemoClaw / OpenClaw hosts intake and operator agents
- TrustPlane is the operator-facing trust and control plane
- routing and delegation between agents are visible and governable
- execution may occur through one or more substrates such as OpenClaw-native tools or OpenShell-backed command flows
- humans still approve, deny, pause, take over, and intervene when required

This document does **not** replace the base integration contract.
It sharpens it for the multi-agent operator model.

## Core framing

TrustPlane should not model work as:

- request -> generic runtime -> magic happens

It should model work as:

- request -> intake agent -> routing decision -> operator agent -> governed execution path -> verification -> evidence

That means TrustPlane needs explicit contract objects for:

- operator agent identity
- operator lane
- delegation decision
- ownership transition
- execution actor
- execution substrate
- agent authority boundary

## Architectural position

### NemoClaw / OpenClaw

Owns:

- agent sessions
- agent identities
- workspace-level boundaries
- orchestration and handoff behavior
- tool access and runtime constraints
- execution through approved substrates

### TrustPlane backend / adapter layer

Owns:

- request-centric projection
- delegation visibility
- ownership visibility
- routing explanation
- trust and execution posture visibility
- translation of runtime events into operator-safe vocabulary

### TrustPlane UI

Owns:

- rendering the active operator topology per request
- rendering why work was routed to a given operator lane
- rendering which agent is allowed to prepare vs execute
- rendering which substrate is in play
- exposing bounded control actions

## New contract objects

## 1. Operator agent record

TrustPlane needs a structured representation of the agent currently participating in the request.

### Minimum fields

```json
{
  "agentId": "access-operator",
  "name": "Access Operator",
  "kind": "operator-agent",
  "lane": "access",
  "runtime": "openclaw",
  "workspace": "~/.openclaw/workspaces/access-operator",
  "sessionType": "persistent",
  "authorityProfile": "bounded_access_changes",
  "allowedSubstrates": ["openclaw-tools", "openshell"],
  "status": "active"
}
```

### Purpose

This object answers:

- who this operator is
- what lane they belong to
- what runtime hosts them
- what authority profile they operate under
- what execution substrates they may use

## 2. Ownership object

TrustPlane needs explicit request ownership state.

### Minimum fields

```json
{
  "requestId": "req_1042",
  "currentOwner": {
    "actorType": "operator-agent",
    "agentId": "access-operator",
    "name": "Access Operator",
    "lane": "access"
  },
  "previousOwner": {
    "actorType": "intake-agent",
    "agentId": "intake",
    "name": "Intake Bot",
    "lane": "intake"
  },
  "assignedAt": "2026-03-29T20:05:00Z",
  "ownershipReason": "normalizedType=access_request and targetSystem=reporting matched the access lane"
}
```

### Purpose

This object answers:

- who currently owns the request
- who owned it before
- why ownership changed
- when the handoff occurred

## 3. Delegation decision object

Routing must be explicit.

### Minimum fields

```json
{
  "requestId": "req_1042",
  "delegationMode": "automatic",
  "routingComponent": "request-router",
  "selectedLane": "access",
  "selectedAgentId": "access-operator",
  "candidateLanes": ["access"],
  "rejectedLanes": [],
  "reason": "clear access request with complete normalized intake object",
  "confidence": "high",
  "humanConfirmationRequired": false
}
```

### Possible delegation modes

- `automatic`
- `suggested`
- `human_confirmed`
- `held_for_clarification`
- `held_for_human_routing`

### Purpose

This object answers:

- who decided routing
- how strong the routing decision was
- whether a human had to confirm it
- which lane and agent were selected
- which lanes were considered and why

## 4. Agent authority boundary

TrustPlane needs a visible boundary per current owner.

### Minimum fields

```json
{
  "requestId": "req_1042",
  "agentId": "access-operator",
  "authorityMode": "prepare_and_execute_with_approval",
  "mayClarify": false,
  "mayPrepare": true,
  "mayExecute": true,
  "mayApprove": false,
  "mayDelegate": false,
  "requiresHumanApprovalBeforeExecution": true,
  "separationOfDutiesRule": "sensitive access cannot be self-approved by the owning operator"
}
```

### Purpose

This object answers:

- what the current operator agent may actually do
- where the boundary is
- whether separation-of-duties rules are in force

## 5. Execution actor object

TrustPlane needs to distinguish the owner from the actor performing execution.
Sometimes they are the same. Sometimes not.

### Minimum fields

```json
{
  "requestId": "req_1042",
  "actorType": "operator-agent",
  "agentId": "access-operator",
  "name": "Access Operator",
  "executionMode": "agent_executed",
  "executionAuthority": "released_after_approval"
}
```

### Valid actor types

- `intake-agent`
- `operator-agent`
- `runtime-automation`
- `human-approver`
- `human-override`

### Valid execution modes

- `not_allowed`
- `prepared_only`
- `agent_executed`
- `human_executed`
- `runtime_automated`

### Purpose

This object answers:

- who actually performs the action path
- whether the request is still only prepared
- whether a human override has taken control

## 6. Execution substrate object

Execution should not be modeled as abstract magic.
TrustPlane should know which substrate is involved.

### Minimum fields

```json
{
  "requestId": "req_1042",
  "substrateId": "openshell",
  "substrateKind": "command-runtime",
  "displayName": "NVIDIA OpenShell",
  "mode": "governed_operator_execution",
  "supportsStreaming": true,
  "supportsVerificationArtifacts": true
}
```

### Example substrate kinds

- `openclaw-tools`
- `command-runtime`
- `api-runtime`
- `human-external-system`

### Purpose

This object answers:

- where the action will actually run
- whether that substrate supports streamed output
- whether artifacts or verification can be captured from it

## 7. Command envelope object

This object is especially important when operator agents execute through OpenShell or another command substrate.

### Minimum fields

```json
{
  "requestId": "req_1042",
  "preparedByAgentId": "change-operator",
  "intendedExecutor": {
    "actorType": "operator-agent",
    "agentId": "change-operator"
  },
  "substrateId": "openshell",
  "command": "vpn-policy update --profile vendor-nightly --allow 203.0.113.10/32",
  "arguments": [
    "update",
    "--profile",
    "vendor-nightly",
    "--allow",
    "203.0.113.10/32"
  ],
  "workingDirectory": "/opt/trustplane/runtime/change-operator",
  "riskClass": "high",
  "approvalState": "pending",
  "rollbackCommand": "vpn-policy rollback --profile vendor-nightly",
  "expectedVerification": "policy_readback_matches_staged_diff"
}
```

### Purpose

This object answers:

- what exact command envelope exists
- who prepared it
- who is intended to execute it
- what substrate will run it
- what approval and rollback conditions apply

## 8. Operator team state object

TrustPlane should be able to show the set of agents relevant to the current request.

### Minimum fields

```json
{
  "requestId": "req_1042",
  "team": [
    {
      "agentId": "intake",
      "name": "Intake Bot",
      "role": "intake",
      "participation": "completed_handoff"
    },
    {
      "agentId": "access-operator",
      "name": "Access Operator",
      "role": "owner",
      "participation": "active"
    },
    {
      "agentId": "duty-operator",
      "name": "Duty Operator",
      "role": "approver",
      "participation": "pending_approval"
    }
  ]
}
```

### Purpose

This object answers:

- which agents participated
- who currently owns the request
- who is waiting on approval or handoff

## Extended event vocabulary

The existing event families should be extended so agent handoff becomes explicit.

### Agent ownership / routing events

- `routing.evaluated`
- `routing.suggested`
- `routing.confirmed`
- `routing.held_for_human_confirmation`
- `ownership.assigned`
- `ownership.transferred`
- `ownership.escalated`

### Agent authority / trust events

- `agent.authority.boundary_set`
- `agent.authority.released_for_execution`
- `agent.authority.revoked`
- `agent.execution.mode.changed`

### Substrate / command events

- `execution.substrate.selected`
- `execution.command.prepared`
- `execution.command.dispatched`
- `execution.command.stdout`
- `execution.command.stderr`
- `execution.command.completed`
- `execution.command.failed`

### Human intervention events

- `human.takeover.started`
- `human.takeover.completed`
- `human.routing.confirmed`
- `human.execution.override.required`

## Example event

```json
{
  "eventId": "evt_3007",
  "requestId": "req_1042",
  "type": "ownership.transferred",
  "actor": "request-router",
  "timestamp": "2026-03-29T20:05:00Z",
  "summary": "Request transferred from Intake Bot to Access Operator after routing matched the access lane"
}
```

## Control actions

The current action set should be extended to support governed multi-agent behavior.

### Existing actions

- approve
- deny
- pause
- resume

### New useful actions

- confirm routing
- re-route request
- request clarification
- escalate to different operator lane
- force human takeover
- downgrade operator authority
- release operator execution authority

## Example actions

### Confirm routing

```json
POST /requests/req_1042/routing/confirm
{
  "actor": "duty-operator",
  "comment": "Access lane confirmed"
}
```

### Re-route request

```json
POST /requests/req_1042/routing/reassign
{
  "actor": "duty-operator",
  "targetAgentId": "change-operator",
  "comment": "This request is actually a policy change, not a standard access grant"
}
```

### Release operator execution authority

```json
POST /requests/req_1042/execution/release
{
  "actor": "duty-operator",
  "agentId": "change-operator",
  "comment": "Approved to execute through OpenShell within the prepared envelope"
}
```

## UI implications

Once these objects exist, TrustPlane should be able to show:

- intake agent
- request router decision
- current owner agent
- current operator lane
- authority boundary
- execution actor
- execution substrate
- command envelope
- approval or takeover points
- transfer/escalation history

This is the difference between:

- generic workflow theater

and:

- a real governed operator-agent system

## Mapping to current docs

This contract extension lines up with the current project direction:

- `minimal-operator-team.md` defines the roster
- `operator-agent-config-examples.md` defines deployment-shaped agent identities
- `delegation-and-routing-model.md` defines the routing boundary
- `runtime-adapter-architecture.md` defines where these projections belong
- `integration-contract.md` remains the base request/workflow/policy contract

## Suggested next implementation steps

The next useful build sequence is:

1. add operator-agent objects to the mock/runtime state
2. add ownership and routing panels to the UI
3. add execution substrate and command-envelope inspection views
4. add one scenario with explicit intake-agent -> operator-agent handoff
5. add one scenario where execution substrate = OpenShell and actor = operator-agent

## Summary

TrustPlane should evolve from showing only request state to showing:

- which governed agent owns the request
- how it got there
- what that agent is allowed to do
- what substrate it may use
- when human approval or takeover is required

That is the operator-agent runtime contract needed for the real TrustPlane vision.
