import type {
  ExecutionStep,
  HumanCheckpoint,
  InspectionRecord,
  Playbook,
  RequestModel,
  Stage,
  TimelineEvent,
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
  stages: Stage[];
  humanCheckpoints: HumanCheckpoint[];
  executionSteps: ExecutionStep[];
  timeline: TimelineEvent[];
  inspections: Record<string, InspectionRecord>;
  playbook: Playbook;
};
