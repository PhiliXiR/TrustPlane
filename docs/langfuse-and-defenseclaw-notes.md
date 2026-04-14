# Langfuse and DefenseClaw Notes

## Purpose

This note captures two current architecture realities worth mentioning in the TrustPlane story:

- Langfuse has been useful for observing prompt and intake behavior in the real conversational path.
- Cisco DefenseClaw is worth evaluating as a future security and control-plane integration surface.

## Langfuse

Langfuse fits the current TrustPlane story as an observability layer around the conversational and intake path.

Useful framing:

- Langfuse tracks prompt inputs, prompt structure, and response behavior for the actual intake/operator flows.
- Langfuse helps inspect how the OpenClaw intake agent, currently running with Codex, clarified requests, what structured payloads were produced, and where prompt behavior drifted.
- Langfuse is not the operator control plane. It is complementary telemetry around the LLM-facing path.

Good short description:

> We used Langfuse to track prompt-level behavior and trace the real intake conversations that fed the governed request path.

What Langfuse should help answer:

- which prompt versions produced better normalization quality
- where clarification loops were too long or too vague
- what request types caused prompt ambiguity
- how prompt/output behavior changed across intake iterations

## DefenseClaw

DefenseClaw should be described as under evaluation, not as a current core dependency.

Safe framing:

- DefenseClaw may become useful as a security-oriented runtime or policy integration surface.
- It is relevant to TrustPlane because TrustPlane benefits from strong security context, enforcement hooks, and richer governed execution boundaries.
- It is currently an area of investigation rather than a baked part of the implementation.

Good short description:

> We are also evaluating Cisco DefenseClaw as a possible future security and governance integration surface.

## Suggested positioning in the repo

These points fit best in:

- `README.md` as a brief forward-looking note
- architecture docs where runtime observability and future integration surfaces are discussed
- demo/interview framing when asked what instrumentation and security direction exist beyond the UI prototype

## Important wording rule

Do not present either of these as the product itself.

- Langfuse is observability for prompt/runtime behavior.
- DefenseClaw is a possible future security integration surface.
- TrustPlane remains the operator-facing control plane centered on the Execution Record.
