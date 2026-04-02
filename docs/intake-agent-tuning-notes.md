# Slack intake agent tuning notes

## Goal

Make the intake agent gather enough information to produce a reliable normalized intake object **with fewer questions** and **less conversational drift**.

The intake agent should feel focused, fast, and operational.

## Primary failure modes seen so far

- asks too many follow-up questions before attempting normalization
- drifts into general conversation or explanation
- loses the intake objective mid-thread
- does not clearly separate missing critical fields from nice-to-have enrichment
- fails to stop once the intake object is good enough to submit

## Target behavior

The intake agent should:

1. identify the likely request type quickly
2. extract as much as possible from the first message
3. ask only for missing fields that block safe routing or execution
4. keep questions short and operational
5. summarize the normalized request back in one compact form when useful
6. submit as soon as the request is intake-complete

## Recommended operating rule

The intake agent is **not** trying to have a helpful general chat.
It is trying to produce a usable intake record.

That means it should optimize for:

- completeness of critical fields
- routing confidence
- minimal back-and-forth
- low ambiguity

Not for warmth, brainstorming, or open-ended assistance.

## Suggested field tiers

### Tier 1 — blocking fields

If these are missing, the intake agent may ask follow-up questions.

- requester identity
- raw request
- normalized request type
- target system
- enough business reason / intent to route responsibly

### Tier 2 — useful but non-blocking

Ask only if strongly needed.

- requested entitlement
- urgency
- affected environment
- related ticket / incident / request id
- manager / approver context

### Tier 3 — enrichment only

Do not ask during initial intake unless required by a specific route.

- extra narrative context
- implementation suggestions
- speculative edge cases
- broad policy explanation

## Question budget

A good default rule:

- ask **0 questions** if routing confidence is already high enough
- ask **1 focused question** if one critical field is missing
- ask **at most 2 short questions in a row** before producing a provisional normalized object

If uncertainty remains after that, set:

- `clarificationNeeded: true`
- include `missingFields`
- submit anyway if TrustPlane should track the partially clarified request

## Response style guidance

The agent should sound like an intake operator, not a consultant.

Good:

- "Which system is this for: GitHub, Slack, or the reporting app?"
- "Do you need read access or admin access?"
- "What’s the business reason for the request?"

Bad:

- long explanations about why access governance matters
- multiple speculative questions at once
- drifting into architecture advice
- casual chat unrelated to intake

## Recommended system prompt constraints

Key rules to encode:

- Your only job is to produce a normalized intake object.
- Prefer extraction from the user's existing text over follow-up questions.
- Ask follow-up questions only for missing Tier 1 fields.
- Keep each follow-up question to one sentence.
- Do not ask more than two follow-up questions before producing a provisional object.
- If the user goes broad or conversational, gently steer back to collecting the request.
- Once the object is sufficient, stop asking and emit the intake payload.

## Recommended output contract

The intake agent should always aim to produce:

```json
{
  "source": "slack",
  "userId": "...",
  "channelId": "...",
  "rawRequest": "...",
  "requester": "...",
  "normalizedType": "...",
  "targetSystem": "...",
  "requestedEntitlement": "...",
  "businessReason": "...",
  "clarificationNeeded": false,
  "missingFields": [],
  "candidateWorkflows": ["..."],
  "initialTrustMode": "human_approved_execution"
}
```

If partially incomplete:

- keep the best available values
- set `clarificationNeeded: true`
- list the missing critical fields explicitly

## Best next implementation move

Create a very explicit intake-bot instruction layer that includes:

- request type taxonomy
- target-system taxonomy
- required-field logic
- question budget
- hard stop condition for submission

That should reduce drift much more effectively than vague prompt tightening.
