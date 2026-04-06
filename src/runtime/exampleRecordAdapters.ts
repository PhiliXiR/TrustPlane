import type { HumanCheckpoint, Stage } from '../types';
import type { IntakeExampleFixture } from './exampleTypes';
import type { RequestSnapshot, RequestTimelineEvent, RequestTimelineResponse } from './requestTypes';

// Example fixtures need a full request-shaped view model when selected in the
// app. These adapters build that coherent record state so example selection can
// switch the visible record, not just decorate the live runtime.
export function deriveRequestSnapshotFromExample(example: IntakeExampleFixture): RequestSnapshot {
  const normalized = example.normalizedN8nOutput as Record<string, string | boolean | string[] | null | undefined>;
  const clarification = example.clarification;
  const workflowCandidate = String(example.expectedTrustPlane.workflowCandidate ?? 'example_workflow');
  const currentState = String(example.expectedTrustPlane.currentState ?? 'awaiting_review');
  const currentOwner = String(example.expectedTrustPlane.currentOwner ?? 'operator');
  const trustLevel = String(example.expectedTrustPlane.trustLevel ?? 'bounded');
  const businessReason = String(normalized.businessReason ?? 'example_request');
  const targetSystem = String(normalized.targetSystem ?? 'example_target');
  const requestedEntitlement = String(normalized.requestedEntitlement ?? 'example_entitlement');
  const requiresHumanReview = example.expectedTimelineEvents.includes('human.approval.requested');

  return {
    request: {
      requestId: example.exampleId,
      source: 'example',
      sourceRef: example.category,
      title: example.label.replace(/^Example:\s*/i, ''),
      rawRequest: example.rawIntakeMessage,
      normalizedRequest: normalized,
      currentState,
      currentOwner,
      workflowCandidate,
      trustState: trustLevel,
      delegationMode: String(normalized.initialTrustMode ?? 'human_approved_execution'),
      createdAt: 'example',
      updatedAt: 'example',
    },
    intakeStatus: {
      intakeState: clarification.needed ? 'clarification_needed' : 'normalized',
      clarificationNeeded: clarification.needed,
      missingContext: Array.isArray(normalized.missingFields) ? (normalized.missingFields as string[]) : [],
      candidateWorkflows: Array.isArray(normalized.candidateWorkflows) ? (normalized.candidateWorkflows as string[]) : [workflowCandidate],
      initialTrustPosture: String(normalized.initialTrustMode ?? 'human_approved_execution'),
    },
    workflowState: {
      state: currentState,
      stateReason: String(example.expectedTrustPlane.operatorSummary ?? 'Example request routed into governed review.'),
      nextStep: requiresHumanReview ? 'Review the example request against the expected governed path.' : 'Compare the example against the expected governed path.',
      blocked: requiresHumanReview,
      blockedReason: requiresHumanReview ? 'Human review is expected for this example fixture.' : null,
    },
    policyDecision: {
      decision: requiresHumanReview ? 'held' : 'allowed',
      basis: `Example workflow candidate: ${workflowCandidate}`,
      requiresHumanReview,
      policyRef: 'example_fixture_policy',
    },
    trustState: {
      trustLevel,
      delegationMode: String(normalized.initialTrustMode ?? 'human_approved_execution'),
      executionMode: requiresHumanReview ? 'prepared_only' : 'observe_only',
      why: String(example.expectedTrustPlane.operatorSummary ?? 'Example fixture routed through governed review.'),
      downgradeTriggers: ['example_fixture_review'],
    },
    pendingAction: {
      actionId: `example-action-${example.exampleId}`,
      actionType: workflowCandidate,
      summary: String(example.expectedTrustPlane.operatorSummary ?? 'Expected governed action for this example fixture.'),
      status: requiresHumanReview ? 'prepared' : 'planned',
      preparedBy: 'example_fixture',
      requiresApproval: requiresHumanReview,
      riskSummary: `Example category: ${example.category}`,
    },
    verificationState: {
      status: 'pending',
      summary: example.expectedEvidenceArtifacts.length > 0
        ? `Expected evidence: ${example.expectedEvidenceArtifacts.join(', ')}`
        : 'Expected evidence not specified for this example.',
      lastCheckedAt: 'example',
      evidenceRefs: example.expectedEvidenceArtifacts,
      failureReason: null,
    },
    artifactSummary: {
      artifactCount: example.expectedEvidenceArtifacts.length,
      artifactTypes: example.expectedEvidenceArtifacts,
      highlights: example.expectedEvidenceArtifacts,
    },
  };
}

// The fixture timeline is derived from expected event names rather than live
// runtime emissions. This keeps example mode deterministic and aligned to the
// documented governed path.
export function deriveTimelineFromExample(example: IntakeExampleFixture): RequestTimelineResponse {
  const events: RequestTimelineEvent[] = example.expectedTimelineEvents.map((eventType, index) => {
    const family = eventType.startsWith('intake.')
      ? 'intake'
      : eventType.startsWith('workflow.')
        ? 'workflow'
        : eventType.startsWith('policy.')
          ? 'policy'
          : eventType.startsWith('human.')
            ? 'human_checkpoint'
            : eventType.startsWith('execution.')
              ? 'execution'
              : eventType.startsWith('verification.')
                ? 'verification'
                : eventType.startsWith('artifact.')
                  ? 'artifact'
                  : eventType.startsWith('ownership.')
                    ? 'ownership'
                    : 'workflow';

    return {
      eventId: `${example.exampleId}-event-${index + 1}`,
      requestId: example.exampleId,
      family,
      type: eventType,
      summary: `${example.label} -> ${eventType}`,
      timestamp: `example-step-${index + 1}`,
      actor: family === 'human_checkpoint' ? 'operator' : family === 'policy' ? 'policy' : family === 'ownership' ? 'router' : 'runtime',
      details: {
        exampleId: example.exampleId,
        category: example.category,
      },
      correlationId: null,
      artifactRefs: family === 'verification' || family === 'artifact' ? example.expectedEvidenceArtifacts : [],
    };
  });

  return {
    requestId: example.exampleId,
    events,
  };
}

// Stage derivation for examples maps fixture lifecycle expectations onto the
// existing rail structure so the app can reuse the current rail component while
// still showing example-native progression.
export function deriveStagesFromExample(example: IntakeExampleFixture, fallbackStages: Stage[]): Stage[] {
  const events = new Set(example.expectedTimelineEvents);
  const clarificationNeeded = example.clarification.needed;
  const awaitingReview = String(example.expectedTrustPlane.currentState ?? '').includes('awaiting_review');

  const stageStatus = (id: string): Stage['status'] => {
    if (id === 'intake') return events.has('intake.request.received') ? 'completed' : 'current';
    if (id === 'classification') {
      if (clarificationNeeded && !events.has('intake.clarification.received')) return 'blocked';
      return events.has('intake.request.normalized') ? 'completed' : 'current';
    }
    if (id === 'policy') return events.has('policy.decision.changed') ? (awaitingReview ? 'current' : 'completed') : 'future';
    if (id === 'approval') return awaitingReview || events.has('human.approval.requested') ? 'current' : 'future';
    if (id === 'tool') return events.has('execution.change.prepared') ? 'future' : 'future';
    if (id === 'verification') return 'future';
    if (id === 'done') return 'future';
    return fallbackStages.find((stage) => stage.id === id)?.status ?? 'future';
  };

  return fallbackStages.map((stage) => ({
    ...stage,
    status: stageStatus(stage.id),
    explanation:
      stage.id === 'intake'
        ? example.rawIntakeMessage
        : stage.id === 'classification'
          ? example.clarification.reason
          : stage.id === 'policy'
            ? `Workflow: ${example.expectedTrustPlane.workflowCandidate ?? 'example_workflow'}`
            : stage.id === 'approval'
              ? example.expectedTrustPlane.operatorSummary ?? stage.explanation
              : stage.explanation,
    reason:
      stage.id === 'classification' && clarificationNeeded
        ? example.clarification.reason
        : stage.reason,
    next:
      stage.id === 'approval'
        ? 'Review the selected example against the expected governed path.'
        : stage.next,
  }));
}

export function deriveCheckpointsFromExample(example: IntakeExampleFixture): HumanCheckpoint[] {
  return [
    {
      id: 'hcp-review',
      label: 'Human review gate',
      state: example.expectedTimelineEvents.includes('human.approval.requested') ? 'current' : 'upcoming',
      detail: String(example.expectedTrustPlane.operatorSummary ?? 'Expected operator review path for this example fixture.'),
    },
    {
      id: 'hcp-execution',
      label: 'Execution authority',
      state: 'upcoming',
      detail: `Expected workflow: ${String(example.expectedTrustPlane.workflowCandidate ?? 'example_workflow')}`,
    },
    {
      id: 'hcp-verification',
      label: 'Outcome verification',
      state: 'upcoming',
      detail: example.expectedEvidenceArtifacts.length > 0
        ? `Expected evidence: ${example.expectedEvidenceArtifacts.join(', ')}`
        : 'Expected verification/evidence path not specified.',
    },
  ];
}
