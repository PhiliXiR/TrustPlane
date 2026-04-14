# Operator Agent Config Examples

## Purpose

This document gives concrete runtime configuration examples for the minimal TrustPlane team.

These examples are not production-ready defaults.
They are meant to show how the workspace scaffolds can line up with deployable agent definitions later.

## Team covered

- Intake Agent
- Access Operator
- Endpoint Operator
- Change Operator

## Design intent

These examples aim for:

- clear workspace ownership
- narrow role boundaries
- constrained tools
- realistic runtime shape
- future compatibility with channel bindings and governed routing

## Example multi-agent config

```json5
{
  agents: {
    list: [
      {
        id: "intake",
        name: "Intake Agent",
        workspace: "./examples/agent-workspaces/intake-agent",
        model: {
          primary: "openai/gpt-5-mini"
        },
        identity: {
          name: "Intake",
          theme: "governed IT intake agent",
          emoji: "📨"
        },
        tools: {
          profile: "coding",
          allow: ["read", "sessions_send", "sessions_spawn", "session_status"],
          deny: ["exec", "process", "write", "edit", "apply_patch"]
        },
        sandbox: {
          mode: "all",
          workspaceAccess: "ro"
        }
      },
      {
        id: "access-operator",
        name: "Access Operator",
        workspace: "./examples/agent-workspaces/access-operator",
        model: {
          primary: "openai/gpt-5-mini"
        },
        identity: {
          name: "Access Operator",
          theme: "governed access workflow operator",
          emoji: "🔐"
        },
        tools: {
          profile: "coding",
          allow: ["read", "write", "edit", "sessions_send", "sessions_spawn", "session_status"],
          deny: ["exec", "process"]
        },
        sandbox: {
          mode: "all",
          workspaceAccess: "rw"
        }
      },
      {
        id: "endpoint-operator",
        name: "Endpoint Operator",
        workspace: "./examples/agent-workspaces/endpoint-operator",
        model: {
          primary: "openai/gpt-5-mini"
        },
        identity: {
          name: "Endpoint Operator",
          theme: "governed endpoint support operator",
          emoji: "💻"
        },
        tools: {
          profile: "coding",
          allow: ["read", "write", "edit", "sessions_send", "sessions_spawn", "session_status"],
          deny: ["exec", "process"]
        },
        sandbox: {
          mode: "all",
          workspaceAccess: "rw"
        }
      },
      {
        id: "change-operator",
        name: "Change Operator",
        workspace: "./examples/agent-workspaces/change-operator",
        model: {
          primary: "openai/gpt-5-mini"
        },
        identity: {
          name: "Change Operator",
          theme: "governed infrastructure change operator",
          emoji: "🛠️"
        },
        tools: {
          profile: "coding",
          allow: ["read", "write", "edit", "sessions_send", "sessions_spawn", "session_status"],
          deny: ["exec", "process"]
        },
        sandbox: {
          mode: "all",
          workspaceAccess: "rw"
        }
      }
    ]
  }
}
```

## Why these choices

### Intake Agent

The intake agent gets the strongest execution restrictions.

It should be able to:

- read context
- communicate or hand off to other sessions
- help route work

It should not directly execute risky commands.

### Access / Endpoint / Change Operators

These operators may eventually need broader tool surfaces than intake, but they should still start bounded.

The examples above:

- allow local workspace mutation
- allow handoff and coordination
- still deny raw execution by default

That keeps the initial examples conservative.

## Example routing model

In a later deployment, routing could look like this:

```json5
{
  bindings: [
    {
      type: "route",
      agentId: "intake",
      match: {
        channel: "slack",
        accountId: "default"
      }
    }
  ]
}
```

Then the intake agent would hand off internally based on normalized request type:

- `access_request` -> `access-operator`
- `endpoint_support` -> `endpoint-operator`
- `infrastructure_change` -> `change-operator`

## Example future ACP shape

If one or more of these agents later uses an ACP harness runtime, the shape would move toward:

```json5
{
  agents: {
    list: [
      {
        id: "change-operator",
        runtime: {
          type: "acp",
          acp: {
            agent: "codex",
            backend: "acpx",
            mode: "persistent",
            cwd: "./examples/agent-workspaces/change-operator"
          }
        }
      }
    ]
  }
}
```

That is optional, but it shows how the same workspace scaffolds could support a real harness-backed runtime later.

For current positioning, keep this framed as an implementation option rather than the headline architecture. The live intake path already runs in OpenClaw, and Codex is a concrete fit when you want a harness-backed conversational intake agent.

## Recommended next refinement

This doc is still a configuration example, not a final policy model.

A useful next step would be to add:

- per-operator tool policy examples
- example handoff rules
- example workflow-to-agent routing map
- example approval boundary map

## Summary

The workspace scaffolds now have matching runtime examples for:

- intake
- access operator
- endpoint operator
- change operator

That makes the tiny TrustPlane team feel much closer to something that could eventually be deployed.
