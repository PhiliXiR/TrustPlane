import type { ExecutionStep, HumanCheckpoint, InspectionRecord, Playbook, RequestModel, Stage, TimelineEvent } from './types';

export const request: RequestModel = {
  title: 'Grant access to reporting app',
  state: 'Paused at human approval before governed execution',
  owner: 'IAM Agent',
  risk: 'medium',
  autonomyMode: 'human-approved execution',
};

export const stages: Stage[] = [
  {
    id: 'submitted',
    label: 'Request Submitted',
    status: 'completed',
    explanation: 'The request entered the runtime with a known target application and a bounded entitlement ask.',
    evidence: ['requestId=req_1042', 'targetApp=Reporting', 'requestedEntitlement=reporting.read'],
    rule: 'Requests with a clear system target may enter structured intake.',
    next: 'The intake agent normalizes the request into a governed runtime object.',
  },
  {
    id: 'intake',
    label: 'Intake',
    status: 'completed',
    explanation: 'The intake agent extracted the target system, requested scope, and business intent into structured state.',
    evidence: ['target app parsed from natural language', 'business need matched to reporting use case', 'request normalized into access_request schema'],
    rule: 'All downstream control logic depends on normalized request state.',
    next: 'Classification confirms workflow family and ownership lane.',
  },
  {
    id: 'classification',
    label: 'Classification',
    status: 'completed',
    explanation: 'The orchestrator classified this as a standard access request with no exception language or escalation indicators.',
    evidence: ['workflow=access_request', 'confidence=high', 'no exception keywords detected'],
    rule: 'Standard access requests can use versioned IAM playbooks.',
    next: 'The orchestrator selects the matching IAM playbook.',
  },
  {
    id: 'playbook',
    label: 'IAM Playbook',
    status: 'completed',
    explanation: 'The runtime selected a governed playbook for analytics read access rather than allowing ad hoc tool use.',
    evidence: ['playbook=analytics-read-standard', 'version=1.4.2', 'allowed tool envelope prepared'],
    rule: 'Known requests should bind to playbooks before any execution path is opened.',
    next: 'Policy check determines whether the playbook may proceed as prepared.',
  },
  {
    id: 'policy',
    label: 'Policy Check',
    status: 'completed',
    explanation: 'Policy evaluation allowed the entitlement in principle but marked it approval-gated because the reporting dataset is governed.',
    evidence: ['policyId=pol_reporting_sensitive_02', 'requester role is within allowed population', 'dataset sensitivity requires approval'],
    rule: 'Sensitive reporting access requires explicit human approval before runtime execution.',
    next: 'A human checkpoint pauses execution and waits for approval.',
  },
  {
    id: 'approval',
    label: 'Approval Check',
    status: 'current',
    explanation: 'The workflow is paused at a trust boundary. The agent has prepared the intended action, but it is not allowed to issue the write until approval is granted.',
    evidence: ['approver role=Reporting Data Owner', 'prepared tool request is reversible', 'execution envelope exists but is blocked'],
    rule: 'The system that decides must also expose where it is not allowed to continue alone.',
    next: 'If approved, the governed runtime can execute the prepared access-grant call.',
  },
  {
    id: 'tool',
    label: 'Tool Execute',
    status: 'future',
    explanation: 'The runtime will execute the access grant through a governed tool interface, not by direct uncontrolled API action.',
    evidence: ['tool=reporting-access.grant', 'sandbox notes present', 'write action currently blocked'],
    rule: 'Execution must happen through a governed runtime envelope.',
    next: 'Verification checks resulting access state against expected post-conditions.',
  },
  {
    id: 'verification',
    label: 'Verification',
    status: 'future',
    explanation: 'Post-execution verification will confirm that the exact entitlement was granted and that no excess permission appeared.',
    evidence: ['expected entitlement=reporting.read', 'verification query prepared', 'artifact template prepared'],
    rule: 'No governed write is complete until verification passes.',
    next: 'The runtime records evidence and closes the request.',
  },
  {
    id: 'done',
    label: 'Done',
    status: 'future',
    explanation: 'The request completes only after execution, verification, and artifact recording are all present.',
    evidence: ['completion artifact pending', 'verification result pending'],
    rule: 'Evidence is part of completion, not an optional afterthought.',
    next: 'No next step.',
  },
];

export const humanCheckpoints: HumanCheckpoint[] = [
  {
    id: 'hc1',
    label: 'Approval requested',
    state: 'completed',
    detail: 'The runtime sent an approval request to the Reporting Data Owner with the prepared action and policy reason.',
  },
  {
    id: 'hc2',
    label: 'Human review pending',
    state: 'current',
    detail: 'A human approver can inspect the request, policy basis, and planned tool action before deciding.',
  },
  {
    id: 'hc3',
    label: 'Execution authority granted',
    state: 'upcoming',
    detail: 'If approved, the system may cross the trust boundary and execute the prepared change.',
  },
];

export const executionSteps: ExecutionStep[] = [
  {
    id: 'ex1',
    label: 'Read account state',
    state: 'completed',
    detail: 'Directory and reporting entitlements were read before any change path was prepared.',
  },
  {
    id: 'ex2',
    label: 'Compare requested access',
    state: 'completed',
    detail: 'The runtime compared requested access against policy and current entitlements.',
  },
  {
    id: 'ex3',
    label: 'Prepare governed tool call',
    state: 'current',
    detail: 'The access-grant request has been assembled but is blocked until approval clears execution.',
  },
  {
    id: 'ex4',
    label: 'Verify resulting state',
    state: 'upcoming',
    detail: 'Verification will confirm the final entitlement state immediately after execution.',
  },
  {
    id: 'ex5',
    label: 'Write audit artifact',
    state: 'upcoming',
    detail: 'An audit artifact will capture request basis, approval, execution, and verification outcome.',
  },
];

export const timeline: TimelineEvent[] = [
  {
    id: 't1',
    time: '10:01',
    title: 'workflow.entered_queue',
    detail: 'Request created and entered the governed runtime intake queue.',
    category: 'request',
    inspectionKey: 'request',
  },
  {
    id: 't2',
    time: '10:01',
    title: 'workflow.classified',
    detail: 'Intake agent parsed target app: Reporting and normalized the request.',
    category: 'workflow',
    inspectionKey: 'request',
  },
  {
    id: 't3',
    time: '10:02',
    title: 'workflow.owner_assigned',
    detail: 'Assigned to IAM Agent under the access_request workflow family.',
    category: 'workflow',
    inspectionKey: 'playbook',
  },
  {
    id: 't4',
    time: '10:03',
    title: 'workflow.playbook_selected',
    detail: 'Playbook selected: analytics-read-standard.',
    category: 'workflow',
    inspectionKey: 'playbook',
  },
  {
    id: 't5',
    time: '10:03',
    title: 'policy.check.completed',
    detail: 'Policy evaluation allowed the entitlement but marked it approval-gated.',
    category: 'policy',
    inspectionKey: 'policy',
  },
  {
    id: 't6',
    time: '10:04',
    title: 'human.approval.requested',
    detail: 'Approval required by policy before the runtime may execute the prepared tool call.',
    category: 'human',
    inspectionKey: 'policy',
  },
  {
    id: 't7',
    time: '10:04',
    title: 'execution.change.prepared',
    detail: 'Governed tool request assembled and held behind the approval boundary.',
    category: 'tool',
    inspectionKey: 'tool',
  },
  {
    id: 't8',
    time: '10:05',
    title: 'verification.check.pending',
    detail: 'Verification and artifact recording are staged but cannot run until execution is allowed.',
    category: 'verification',
    inspectionKey: 'artifact',
  },
];

export const inspections: Record<string, InspectionRecord> = {
  request: {
    title: 'Raw request JSON',
    content: `{
  "requestId": "req_1042",
  "workflow": "access_request",
  "targetApp": "reporting",
  "requestedEntitlement": "reporting.read",
  "requester": "analyst@company",
  "requesterRole": "analyst",
  "businessReason": "weekly dashboard review",
  "risk": "medium"
}`,
  },
  tool: {
    title: 'Raw tool request / response',
    content: `{
  "tool": "reporting-access.grant",
  "runtimeMode": "governed",
  "status": "prepared_not_executed",
  "input": {
    "user": "analyst@company",
    "entitlement": "reporting.read"
  },
  "response": null,
  "blockedBy": "human.approval.required"
}`,
  },
  policy: {
    title: 'Policy metadata',
    content: `{
  "policyId": "pol_reporting_sensitive_02",
  "name": "Sensitive Reporting Dataset Approval",
  "decision": "approval_required",
  "requiredApprover": "Reporting Data Owner",
  "delegationMode": "human_approved_execution",
  "reason": "target dataset contains governed reporting information"
}`,
  },
  playbook: {
    title: 'Playbook version',
    content: `{
  "playbook": "analytics-read-standard",
  "version": "1.4.2",
  "allowedTools": ["directory.lookup", "reporting-access.grant", "access.verify"],
  "runtime": "governed-agent-runtime",
  "sandboxMode": "write-blocked-until-approved"
}`,
  },
  artifact: {
    title: 'Artifact preview',
    content: `{
  "artifactType": "access_change_record",
  "status": "pending",
  "willInclude": [
    "request basis",
    "policy decision",
    "approval outcome",
    "executed tool request",
    "verification result"
  ]
}`,
  },
};

export const playbook: Playbook = {
  name: 'analytics-read-standard',
  trigger: 'Standard request for reporting read access',
  preconditions: [
    'Target app is registered in the access catalog',
    'Requester role is recognized',
    'Requested entitlement is within approved reporting scope',
  ],
  allowedTools: ['reporting-access.grant', 'directory.lookup', 'access.verify'],
  approvalRequirement: 'Required for governed reporting datasets before any write action.',
  rollback: 'Remove entitlement, run verification again, and attach rollback artifact.',
};
