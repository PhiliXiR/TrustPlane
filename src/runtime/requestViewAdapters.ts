import type { ExecutionStep, HumanCheckpoint, InspectionRecord, Playbook, Stage } from '../types';
import type { IntakeExampleFixture } from './exampleTypes';
import type { RequestSnapshot, RequestTimelineEvent } from './requestTypes';

export function deriveWorkflowRailStages(snapshot: RequestSnapshot | null | undefined, fallbackStages: Stage[]): Stage[] {
  if (!snapshot) return fallbackStages;

  const workflowState = snapshot.workflowState;
  const pending = snapshot.pendingAction;
  const verification = snapshot.verificationState;
  const blocked = workflowState.blocked;
  const policyHeld = snapshot.policyDecision.requiresHumanReview && pending.requiresApproval;

  const stageFor = (id: string): Stage['status'] => {
    if (id === 'intake') {
      return snapshot.intakeStatus.clarificationNeeded ? 'current' : 'completed';
    }
    if (id === 'classification') {
      if (snapshot.intakeStatus.clarificationNeeded) return 'blocked';
      if (workflowState.state === 'classification') return 'current';
      return 'completed';
    }
    if (id === 'policy') {
      if (snapshot.policyDecision.decision === 'blocked') return 'blocked';
      if (policyHeld) return 'current';
      return pending.status === 'prepared' || pending.status === 'executing' || pending.status === 'completed' ? 'completed' : 'future';
    }
    if (id === 'approval') {
      if (policyHeld) return 'current';
      if (pending.status === 'denied') return 'blocked';
      return ['executing', 'completed'].includes(pending.status) ? 'completed' : 'future';
    }
    if (id === 'tool') {
      if (pending.status === 'executing') return 'current';
      return pending.status === 'completed' ? 'completed' : blocked ? 'blocked' : 'future';
    }
    if (id === 'verification') {
      if (verification.status === 'pending') return 'current';
      if (verification.status === 'failed') return 'blocked';
      return verification.status === 'passed' ? 'completed' : 'future';
    }
    if (id === 'done') {
      return verification.status === 'passed' ? 'completed' : 'future';
    }
    if (workflowState.state === id) return blocked ? 'blocked' : 'current';
    return fallbackStages.find((stage) => stage.id === id)?.status ?? 'future';
  };

  return fallbackStages.map((stage) => ({
    ...stage,
    status: stageFor(stage.id),
    explanation:
      stage.id === workflowState.state
        ? workflowState.stateReason
        : stage.id === 'policy'
          ? snapshot.policyDecision.basis
          : stage.id === 'tool'
            ? pending.summary
            : stage.id === 'verification'
              ? verification.summary
              : stage.explanation,
    reason:
      stage.id === workflowState.state && blocked
        ? workflowState.blockedReason ?? stage.reason
        : stage.id === 'verification' && verification.failureReason
          ? verification.failureReason
          : stage.reason,
    next:
      stage.id === workflowState.state
        ? workflowState.nextStep
        : stage.next,
  }));
}

export function deriveWorkflowRailStagesFromExample(example: IntakeExampleFixture | null | undefined, fallbackStages: Stage[]): Stage[] {
  if (!example) return fallbackStages;

  const events = new Set(example.expectedTimelineEvents);
  const state = example.expectedTrustPlane.currentState ?? 'awaiting_review';

  const stageFor = (id: string): Stage['status'] => {
    if (id === 'intake') {
      return events.has('intake.request.received') ? 'completed' : 'current';
    }
    if (id === 'classification') {
      return example.clarification.needed && !events.has('intake.clarification.received') ? 'blocked' : events.has('intake.request.normalized') ? 'completed' : 'current';
    }
    if (id === 'policy') {
      if (events.has('policy.decision.changed') && state === 'awaiting_review') return 'current';
      return events.has('policy.decision.changed') ? 'completed' : 'future';
    }
    if (id === 'approval') {
      return state === 'awaiting_review' || events.has('human.approval.requested') ? 'current' : 'future';
    }
    if (id === 'tool') {
      return events.has('execution.change.prepared') ? 'future' : 'future';
    }
    if (id === 'verification') {
      return 'future';
    }
    if (id === 'done') {
      return 'future';
    }
    return fallbackStages.find((stage) => stage.id === id)?.status ?? 'future';
  };

  return fallbackStages.map((stage) => ({
    ...stage,
    status: stageFor(stage.id),
    explanation:
      stage.id === 'intake'
        ? example.rawIntakeMessage
        : stage.id === 'classification'
          ? example.clarification.reason
          : stage.id === 'policy'
            ? `Workflow: ${example.expectedTrustPlane.workflowCandidate ?? 'unknown'}`
            : stage.id === 'approval'
              ? example.expectedTrustPlane.operatorSummary ?? stage.explanation
              : stage.explanation,
    reason:
      stage.id === 'classification' && example.clarification.needed
        ? example.clarification.reason
        : stage.reason,
    next:
      stage.id === 'approval'
        ? 'Review the example request and compare its expected policy/timeline/evidence path.'
        : stage.next,
  }));
}

export function deriveHumanCheckpoints(snapshot: RequestSnapshot | null | undefined, fallbackCheckpoints: HumanCheckpoint[]): HumanCheckpoint[] {
  if (!snapshot) return fallbackCheckpoints;

  const reviewState: HumanCheckpoint['state'] = snapshot.policyDecision.requiresHumanReview
    ? (snapshot.pendingAction.requiresApproval ? 'current' : 'completed')
    : 'completed';

  const executionState: HumanCheckpoint['state'] = snapshot.pendingAction.status === 'executing'
    ? 'current'
    : snapshot.pendingAction.status === 'completed'
      ? 'completed'
      : 'upcoming';

  const verificationState: HumanCheckpoint['state'] = snapshot.verificationState.status === 'pending'
    ? 'current'
    : snapshot.verificationState.status === 'passed'
      ? 'completed'
      : snapshot.verificationState.status === 'failed'
        ? 'current'
        : 'upcoming';

  return [
    {
      id: 'hcp-review',
      label: 'Human review gate',
      state: reviewState,
      detail: snapshot.policyDecision.requiresHumanReview
        ? snapshot.policyDecision.basis
        : 'No human review gate is currently required for the next step.',
    },
    {
      id: 'hcp-execution',
      label: 'Execution authority',
      state: executionState,
      detail: snapshot.pendingAction.summary,
    },
    {
      id: 'hcp-verification',
      label: 'Outcome verification',
      state: verificationState,
      detail: snapshot.verificationState.summary,
    },
  ];
}

export function deriveExecutionTrace(snapshot: RequestSnapshot | null | undefined, fallbackSteps: ExecutionStep[]): ExecutionStep[] {
  if (!snapshot) return fallbackSteps;

  const pending = snapshot.pendingAction;
  const verification = snapshot.verificationState;

  return [
    {
      id: 'exec-prepared',
      label: 'Prepared governed action',
      state: ['prepared', 'executing', 'completed'].includes(pending.status) ? 'completed' : 'upcoming',
      detail: pending.summary,
    },
    {
      id: 'exec-release',
      label: 'Execution release window',
      state: pending.status === 'executing' ? 'current' : pending.status === 'completed' ? 'completed' : 'upcoming',
      detail: pending.requiresApproval
        ? 'Execution remains gated until the human review requirement is satisfied.'
        : 'The action can proceed within its current governed execution window.',
    },
    {
      id: 'exec-verify',
      label: 'Verification outcome',
      state: verification.status === 'pending' ? 'current' : verification.status === 'passed' ? 'completed' : 'upcoming',
      detail: verification.summary,
    },
  ];
}

export function derivePlaybookSummary(snapshot: RequestSnapshot | null | undefined, fallbackPlaybook: Playbook): Playbook {
  if (!snapshot) return fallbackPlaybook;

  return {
    ...fallbackPlaybook,
    name: snapshot.request.workflowCandidate,
    trigger: `${snapshot.request.source} request for ${String(snapshot.request.normalizedRequest.targetSystem ?? 'unknown target')}`,
    approvalRequirement: snapshot.policyDecision.requiresHumanReview
      ? snapshot.policyDecision.basis
      : 'No human approval is currently required for the next governed step.',
    rollback: snapshot.pendingAction.riskSummary ?? fallbackPlaybook.rollback,
    preconditions: [
      `Trust level: ${snapshot.trustState.trustLevel}`,
      `Delegation mode: ${snapshot.trustState.delegationMode}`,
      `Verification status: ${snapshot.verificationState.status}`,
      ...fallbackPlaybook.preconditions,
    ],
    allowedTools: Array.from(new Set([
      ...fallbackPlaybook.allowedTools,
      snapshot.pendingAction.actionType,
    ])),
  };
}

export function deriveEvidenceSummary(
  snapshot: RequestSnapshot | null | undefined,
  requestEvent: RequestTimelineEvent | null | undefined,
  fallbackRecord: InspectionRecord,
) {
  const detailPairs = Object.entries(requestEvent?.details ?? {}).map(([key, value]) => ({
    key,
    value: Array.isArray(value) ? value.join(', ') : String(value),
  }));

  return {
    title: requestEvent?.type ?? fallbackRecord.title,
    family: requestEvent?.family ?? 'workflow',
    artifactRefs: requestEvent?.artifactRefs ?? [],
    detailPairs,
    evidenceRefs: snapshot?.verificationState.evidenceRefs ?? [],
    artifactHighlights: snapshot?.artifactSummary.highlights ?? [],
    artifactTypes: snapshot?.artifactSummary.artifactTypes ?? [],
    verificationStatus: snapshot?.verificationState.status ?? 'unknown',
  };
}
