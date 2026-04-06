import type { IntakeExampleFixture } from './exampleTypes';

// This is intentionally lightweight: it provides just enough example metadata
// to let the main UI advertise example mode clearly without forcing every panel
// to know the raw fixture shape.
export function deriveExampleModeSummary(example: IntakeExampleFixture | null) {
  if (!example) return null;

  return {
    title: example.label.replace(/^Example:\s*/i, ''),
    state: example.expectedTrustPlane.currentState ?? 'awaiting_review',
    owner: example.expectedTrustPlane.currentOwner ?? 'operator',
    workflow: example.expectedTrustPlane.workflowCandidate ?? 'unknown_workflow',
    trustLevel: example.expectedTrustPlane.trustLevel ?? 'bounded',
    operatorSummary: example.expectedTrustPlane.operatorSummary ?? '',
    clarificationNeeded: example.clarification.needed,
    timelineCount: example.expectedTimelineEvents.length,
    evidenceCount: example.expectedEvidenceArtifacts.length,
  };
}
