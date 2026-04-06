import type { IntakeExampleFixture } from './exampleTypes';

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
