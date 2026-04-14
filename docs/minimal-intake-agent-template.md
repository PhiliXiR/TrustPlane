# Minimal Intake Agent Template

## Purpose

This document defines a minimal but realistic agent structure for an eventual Slack-facing intake agent.

The goal is not to create a fake product demo.
The goal is to define a structure that could later be deployed through a real runtime such as OpenClaw or another governed agent system.

## Design goal

The intake agent should be able to:

- talk to humans in Slack
- gather missing information
- normalize requests
- detect ambiguity
- request clarification
- select candidate workflows
- hand off the request into a governed runtime path

It should **not** be treated as a fully autonomous execution bot.

## Deployment shape

The deployable structure should have two layers:

### 1. Workspace bootstrap files

These define identity, operating style, context handling, and local instructions.

### 2. Runtime/config definition

This defines:

- runtime type
- model
- tools
- channel bindings
- permissions
- sandbox profile
- handoff behavior

## Minimal workspace layout

```text
intake-agent/
├── AGENTS.md
├── SOUL.md
├── TOOLS.md
├── IDENTITY.md
├── USER.md
├── HEARTBEAT.md
├── memory/
│   └── YYYY-MM-DD.md
└── skills/
```

Optional first-run file:

```text
BOOTSTRAP.md
```

## Required workspace files

### AGENTS.md

Defines:

- session startup behavior
- memory rules
- group chat rules
- red lines
- how the bot should operate in Slack

For intake, AGENTS.md should emphasize:

- normalize before routing
- ask clarification questions when required
- do not invent missing entitlement details
- do not claim execution authority for risky changes

### SOUL.md

Defines:

- conversational tone
- persona
- interaction style
- how the bot talks to users during intake

For intake, the tone should be:

- calm
- concise
- operationally clear
- not theatrical

### TOOLS.md

Defines local environment notes such as:

- Slack workspace conventions
- Jira project names
- common app/system aliases
- escalation contacts
- naming conventions for systems and entitlements

### IDENTITY.md

Defines:

- bot name
- vibe
- visible identity traits

Example:

```markdown
# IDENTITY.md

- Name: Intake
- Role: Slack intake agent for IT support workflows
- Emoji: 📨
- Vibe: clear, calm, operational
```

### USER.md

For a team/deployment bot, this should describe the human organization context rather than a single person.

Example:

```markdown
# USER.md

- Primary users: employees requesting help through Slack
- Environment: internal IT support workflows
- Tone preference: concise and professional
```

### HEARTBEAT.md

Optional lightweight maintenance tasks.

For intake, likely minimal or empty.

## Runtime/config shape

A deployable runtime should also define the bot in config.

## Example agent entry

```json5
{
  agents: {
    list: [
      {
        id: "intake",
        default: false,
        name: "Intake Agent",
        workspace: "~/.openclaw/workspaces/intake-agent",
        model: {
          primary: "openai/gpt-5-mini"
        },
        identity: {
          name: "Intake",
          theme: "IT intake agent",
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
      }
    ]
  }
}
```

## Why this shape matters

This gives the intake agent:

- identity
- runtime configuration
- explicit tool boundaries
- deployable workspace path
- future compatibility with bindings and channel routing

That is much more realistic than a vague role label.

## Slack binding shape

Eventually, the intake agent would be bound to a Slack channel, DM surface, or request thread.

Example shape:

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

In a more precise deployment, routing could instead target:

- a specific Slack channel
- a specific request queue channel
- a dedicated bot DM surface

## What the intake agent should hand off

The intake agent should not just emit free text.
It should eventually hand off a normalized request object containing fields like:

- source
- raw request
- normalized type
- target system
- requested action
- ambiguity state
- missing fields
- clarification status
- candidate workflows
- initial trust mode

## Suggested future specializations

As the system grows, this bot could gain:

- Slack-specific clarification skills
- Jira ticket creation skills
- request schema validation skills
- intake classification skills

But the minimal deployable form should stay small.

## Summary

A realistic intake agent needs:

- a dedicated workspace
- bootstrap files for behavior and identity
- an explicit runtime agent entry
- constrained tools
- a channel binding
- a handoff contract into the governed runtime

That is the smallest structure that still looks deployable later.
