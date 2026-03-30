export type StageStatus = 'completed' | 'current' | 'future' | 'blocked';

export type Stage = {
  id: string;
  label: string;
  status: StageStatus;
  reason?: string;
  explanation: string;
  evidence: string[];
  rule: string;
  next: string;
};

export type TimelineCategory = 'request' | 'workflow' | 'policy' | 'human' | 'tool' | 'verification' | 'artifact';

export type TimelineEvent = {
  id: string;
  time: string;
  title: string;
  detail: string;
  category: TimelineCategory;
  inspectionKey?: string;
};

export type InspectionRecord = {
  title: string;
  content: string;
};

export type Playbook = {
  name: string;
  trigger: string;
  preconditions: string[];
  allowedTools: string[];
  approvalRequirement: string;
  rollback: string;
};

export type IntakeMetadata = {
  requestId: string;
  source: string;
  requester: string;
  rawRequest: string;
  normalizedType: string;
  targetSystem: string;
  requestedEntitlement?: string | null;
  businessReason?: string | null;
  clarificationNeeded: boolean;
  missingFields: string[];
  candidateWorkflows: string[];
  initialTrustMode: string;
  userId?: string | null;
  channelId?: string | null;
};

export type OperatorAgent = {
  agentId: string;
  name: string;
  kind: 'intake-agent' | 'operator-agent' | 'human-approver';
  lane: string;
  runtime: string;
  workspace?: string | null;
  sessionType?: string | null;
  authorityProfile?: string | null;
  allowedSubstrates: string[];
  status: string;
};

export type OwnershipRecord = {
  actorType: 'intake-agent' | 'operator-agent' | 'human-approver' | 'human-override';
  agentId?: string | null;
  name: string;
  lane: string;
};

export type OwnershipState = {
  currentOwner: OwnershipRecord;
  previousOwner?: OwnershipRecord | null;
  assignedAt: string;
  ownershipReason: string;
};

export type DelegationState = {
  delegationMode: 'automatic' | 'suggested' | 'human_confirmed' | 'held_for_clarification' | 'held_for_human_routing';
  routingComponent: string;
  selectedLane: string;
  selectedAgentId?: string | null;
  candidateLanes: string[];
  rejectedLanes: string[];
  reason: string;
  confidence: string;
  humanConfirmationRequired: boolean;
};

export type AgentAuthorityBoundary = {
  agentId: string;
  authorityMode: string;
  mayClarify: boolean;
  mayPrepare: boolean;
  mayExecute: boolean;
  mayApprove: boolean;
  mayDelegate: boolean;
  requiresHumanApprovalBeforeExecution: boolean;
  separationOfDutiesRule: string;
};

export type ExecutionSubstrate = {
  substrateId: string;
  substrateKind: string;
  displayName: string;
  mode: string;
  supportsStreaming: boolean;
  supportsVerificationArtifacts: boolean;
};

export type RequestModel = {
  title: string;
  state: string;
  owner: string;
  risk: string;
  autonomyMode: string;
  intake?: IntakeMetadata | null;
};

export type ExecutionStep = {
  id: string;
  label: string;
  state: 'completed' | 'current' | 'upcoming';
  detail: string;
};

export type HumanCheckpoint = {
  id: string;
  label: string;
  state: 'completed' | 'current' | 'upcoming';
  detail: string;
};
