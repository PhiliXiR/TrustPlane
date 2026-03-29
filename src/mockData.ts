import type { InspectionRecord, Playbook, RequestModel, Stage, TimelineEvent } from './types';

export const request: RequestModel = {
  title: 'Grant access to reporting app',
  state: 'Approval required before governed tool execution',
  owner: 'IAM Agent',
  risk: 'medium',
  autonomyMode: 'human-approved execution',
};

export const stages: Stage[] = [
  {
    id: 'submitted',
    label: 'Request Submitted',
    status: 'completed',
    explanation: 'The request entered the runtime with a named target app and a standard business need.',
    evidence: ['Requester: analyst@company', 'Target app: Reporting', 'Requested entitlement: analytics-read'],
    rule: 'Requests with a clear target system can enter guided intake immediately.',
    next: 'Intake agent parses request fields.',
  },
  {
    id: 'intake',
    label: 'Intake',
    status: 'completed',
    explanation: 'The intake agent normalized the request into a structured access request object.',
    evidence: ['Intent parsed from plain language', 'Business context extracted', 'Target app mapped to internal service registry'],
    rule: 'Ungoverned free text must be normalized before downstream workflow selection.',
    next: 'Classification confirms workflow family.',
  },
  {
    id: 'classification',
    label: 'Classification',
    status: 'completed',
    explanation: 'The runtime classified the request as a standard access request with no exception language.',
    evidence: ['class=access_request', 'confidence=high', 'no privilege escalation keywords detected'],
    rule: 'High-confidence access requests may route directly to IAM playbooks.',
    next: 'IAM playbook selection.',
  },
  {
    id: 'playbook',
    label: 'IAM Playbook',
    status: 'completed',
    explanation: 'A governed IAM playbook was selected because the request matches the standard reporting access path.',
    evidence: ['playbook=analytics-read-standard', 'version=1.4.2', 'target entitlement=reporting.read'],
    rule: 'Known access patterns should use versioned playbooks rather than ad hoc execution.',
    next: 'Policy check validates whether the playbook is allowed.',
  },
  {
    id: 'policy',
    label: 'Policy Check',
    status: 'completed',
    explanation: 'Policy evaluation confirmed that the requested entitlement is allowed for this role, but still requires approval because the app contains sensitive reporting data.',
    evidence: ['role match: analyst', 'requested entitlement within approved bounds', 'sensitive-data policy applied'],
    rule: 'Sensitive reporting data requires explicit approval before any write action is issued.',
    next: 'Approval check awaits a human decision.',
  },
  {
    id: 'approval',
    label: 'Approval Check',
    status: 'current',
    explanation: 'The workflow is paused at a human checkpoint. The agent may prepare the governed tool call, but it may not execute until the approver confirms the request.',
    evidence: ['approver role: Reporting Data Owner', 'approval reason: access to governed dataset', 'prepared action is reversible'],
    rule: 'Governed datasets require human approval before runtime execution.',
    next: 'If approved, the runtime will issue the governed tool request.',
  },
  {
    id: 'tool',
    label: 'Tool Execute',
    status: 'future',
    explanation: 'The governed runtime will call the reporting access API only after approval is granted.',
    evidence: ['tool: reporting-access.grant', 'sandboxed request envelope prepared'],
    rule: 'No external write action is permitted before approval.',
    next: 'Verification checks resulting access state.',
  },
  {
    id: 'verification',
    label: 'Verification',
    status: 'future',
    explanation: 'Verification will confirm that the granted access matches the expected entitlement and no excess permission was introduced.',
    evidence: ['expected entitlement: reporting.read', 'post-condition check pending'],
    rule: 'Every governed write requires verification before completion.',
    next: 'Timeline records the verified outcome.',
  },
  {
    id: 'done',
    label: 'Done',
    status: 'future',
    explanation: 'The request will close only after execution, verification, and recording are complete.',
    evidence: ['artifact generation pending', 'final state pending'],
    rule: 'Completion requires evidence, not just execution intent.',
    next: 'No next step.',
  },
];

export const timeline: TimelineEvent[] = [
  {
    id: 't1',
    time: '10:01',
    title: 'Request created',
    detail: 'Analyst requested access to the reporting app for weekly dashboard work.',
    category: 'request',
    inspectionKey: 'request',
  },
  {
    id: 't2',
    time: '10:01',
    title: 'Intake agent parsed target app: Reporting',
    detail: 'The intake agent extracted target application and entitlement intent from the request text.',
    category: 'workflow',
    inspectionKey: 'request',
  },
  {
    id: 't3',
    time: '10:02',
    title: 'Classified as access_request',
    detail: 'The orchestrator routed the request into the access workflow family.',
    category: 'workflow',
    inspectionKey: 'policy',
  },
  {
    id: 't4',
    time: '10:02',
    title: 'Assigned to IAM Agent',
    detail: 'IAM Agent accepted ownership based on the standard access-request playbook.',
    category: 'workflow',
    inspectionKey: 'playbook',
  },
  {
    id: 't5',
    time: '10:03',
    title: 'Playbook selected: analytics-read-standard',
    detail: 'The request matched a versioned, governed playbook for reporting read access.',
    category: 'workflow',
    inspectionKey: 'playbook',
  },
  {
    id: 't6',
    time: '10:03',
    title: 'Approval required by policy',
    detail: 'Sensitive-data policy requires human approval before any access grant is executed.',
    category: 'policy',
    inspectionKey: 'policy',
  },
  {
    id: 't7',
    time: '10:04',
    title: 'Governed tool call prepared',
    detail: 'Runtime assembled a sandboxed access-grant request but is holding execution pending approval.',
    category: 'tool',
    inspectionKey: 'tool',
  },
];

export const inspections: Record<string, InspectionRecord> = {
  request: {
    title: 'Raw request JSON',
    content: `{
  "requestId": "req_1042",
  "type": "access_request",
  "targetApp": "reporting",
  "requestedEntitlement": "reporting.read",
  "requesterRole": "analyst",
  "businessReason": "weekly dashboard review",
  "risk": "medium"
}`,
  },
  tool: {
    title: 'Raw tool request / response',
    content: `{
  "tool": "reporting-access.grant",
  "mode": "prepared_not_executed",
  "input": {
    "user": "analyst@company",
    "entitlement": "reporting.read"
  },
  "response": null,
  "blockedBy": "approval_required"
}`,
  },
  policy: {
    title: 'Policy metadata',
    content: `{
  "policyId": "pol_reporting_sensitive_02",
  "name": "Sensitive Reporting Dataset Approval",
  "decision": "approval_required",
  "reason": "target dataset contains governed reporting information",
  "requiredApprover": "Reporting Data Owner"
}`,
  },
  playbook: {
    title: 'Playbook version',
    content: `{
  "playbook": "analytics-read-standard",
  "version": "1.4.2",
  "runtime": "governed-agent-runtime",
  "sandboxMode": "write-blocked-until-approved"
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
  rollback: 'Remove entitlement and issue verification pass after rollback confirmation.',
};
