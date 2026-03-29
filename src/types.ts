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

export type TimelineEvent = {
  id: string;
  time: string;
  title: string;
  detail: string;
  category: 'request' | 'workflow' | 'policy' | 'human' | 'tool' | 'verification';
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

export type RequestModel = {
  title: string;
  state: string;
  owner: string;
  risk: string;
  autonomyMode: string;
};
