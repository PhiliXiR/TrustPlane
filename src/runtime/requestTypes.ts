export type RequestSnapshot = {
  request: {
    requestId: string;
    source: string;
    sourceRef?: string | null;
    title: string;
    rawRequest: string;
    normalizedRequest: Record<string, string | boolean | string[] | null | undefined>;
    currentState: string;
    currentOwner: string;
    workflowCandidate: string;
    trustState: string;
    delegationMode: string;
    createdAt: string;
    updatedAt: string;
  };
  intakeStatus: {
    intakeState: string;
    clarificationNeeded: boolean;
    missingContext: string[];
    candidateWorkflows: string[];
    initialTrustPosture: string;
  };
  workflowState: {
    state: string;
    stateReason: string;
    nextStep: string;
    blocked: boolean;
    blockedReason?: string | null;
  };
  policyDecision: {
    decision: string;
    basis: string;
    requiresHumanReview: boolean;
    policyRef?: string | null;
  };
  trustState: {
    trustLevel: string;
    delegationMode: string;
    executionMode: string;
    why: string;
    downgradeTriggers: string[];
  };
  pendingAction: {
    actionId: string;
    actionType: string;
    summary: string;
    status: string;
    preparedBy: string;
    requiresApproval: boolean;
    riskSummary?: string | null;
  };
  verificationState: {
    status: string;
    summary: string;
    lastCheckedAt: string;
    evidenceRefs: string[];
    failureReason?: string | null;
  };
  artifactSummary: {
    artifactCount: number;
    artifactTypes: string[];
    highlights: string[];
  };
};

export type RequestTimelineEvent = {
  eventId: string;
  requestId: string;
  family: 'intake' | 'workflow' | 'policy' | 'human_checkpoint' | 'execution' | 'verification' | 'artifact' | 'trust' | 'ownership';
  type: string;
  summary: string;
  timestamp: string;
  actor: string;
  details?: Record<string, string | boolean | string[] | undefined> | null;
  correlationId?: string | null;
  artifactRefs: string[];
};

export type RequestTimelineResponse = {
  requestId: string;
  events: RequestTimelineEvent[];
};
