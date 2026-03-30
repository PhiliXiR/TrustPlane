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
