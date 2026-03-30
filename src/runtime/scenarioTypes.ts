import type {
  AgentAuthorityBoundary,
  CommandEnvelope,
  ExecutionStep,
  ExecutionSubstrate,
  HumanCheckpoint,
  InspectionRecord,
  OperatorAgent,
  OwnershipState,
  Playbook,
  RequestModel,
  Stage,
  TimelineEvent,
  DelegationState,
} from '../types';

export type TrustModel = {
  level: string;
  currentBoundary: string;
  delegationRule: string;
  downgradeRule: string;
};

export type RuntimeScenario = {
  id: string;
  label: string;
  request: RequestModel;
  trustModel: TrustModel;
  operators: OperatorAgent[];
  ownership: OwnershipState;
  delegation: DelegationState;
  authorityBoundary: AgentAuthorityBoundary;
  executionSubstrate: ExecutionSubstrate;
  commandEnvelope: CommandEnvelope;
  stages: Stage[];
  humanCheckpoints: HumanCheckpoint[];
  executionSteps: ExecutionStep[];
  timeline: TimelineEvent[];
  inspections: Record<string, InspectionRecord>;
  playbook: Playbook;
};
