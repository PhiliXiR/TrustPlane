# Intake Fixture Examples

These files are canonical **examples** for the implemented intake-bot -> watcher -> `n8n` -> TrustPlane path.

They are intended as:

- example inputs for intake-bot and normalization work
- example governed requests for TrustPlane demos
- seeds for future automated regression fixtures

## Structure

Each JSON file contains:

- `exampleId`
- `label`
- `category`
- `rawIntakeMessage`
- `clarification`
- `normalizedN8nOutput`
- `expectedTrustPlane`
- `expectedTimelineEvents`
- `expectedEvidenceArtifacts`

## Canonical docs

For the human-readable versions of these examples, see:

- `../../docs/intake-submission-examples.md`
- `../../docs/intake-fixture-pack.md`

## Important note

These are labeled as **examples** intentionally.
They are not yet wired as automated tests by default, but they are structured so they can become test fixtures later.
