from pydantic import BaseModel
from typing import Dict, List, Literal, Optional

StageStatus = Literal['completed', 'current', 'future', 'blocked']
TimelineCategory = Literal['request', 'workflow', 'policy', 'human', 'tool', 'verification', 'artifact']
StepState = Literal['completed', 'current', 'upcoming']
AgentKind = Literal['intake-agent', 'operator-agent', 'human-approver']
OwnershipActorType = Literal['intake-agent', 'operator-agent', 'human-approver', 'human-override']
DelegationMode = Literal['automatic', 'suggested', 'human_confirmed', 'held_for_clarification', 'held_for_human_routing']
CommandExecutorType = Literal['operator-agent', 'human-approver', 'human-override']


class IntakeMetadata(BaseModel):
    requestId: str
    source: str
    requester: str
    rawRequest: str
    normalizedType: str
    targetSystem: str
    requestedEntitlement: Optional[str] = None
    businessReason: Optional[str] = None
    clarificationNeeded: bool = False
    missingFields: List[str] = []
    candidateWorkflows: List[str] = []
    initialTrustMode: str
    userId: Optional[str] = None
    channelId: Optional[str] = None


class RequestModel(BaseModel):
    title: str
    state: str
    owner: str
    risk: str
    autonomyMode: str
    intake: Optional[IntakeMetadata] = None


class TrustModel(BaseModel):
    level: str
    currentBoundary: str
    delegationRule: str
    downgradeRule: str


class OperatorAgent(BaseModel):
    agentId: str
    name: str
    kind: AgentKind
    lane: str
    runtime: str
    workspace: Optional[str] = None
    sessionType: Optional[str] = None
    authorityProfile: Optional[str] = None
    allowedSubstrates: List[str]
    status: str


class OwnershipRecord(BaseModel):
    actorType: OwnershipActorType
    agentId: Optional[str] = None
    name: str
    lane: str


class OwnershipState(BaseModel):
    currentOwner: OwnershipRecord
    previousOwner: Optional[OwnershipRecord] = None
    assignedAt: str
    ownershipReason: str


class DelegationState(BaseModel):
    delegationMode: DelegationMode
    routingComponent: str
    selectedLane: str
    selectedAgentId: Optional[str] = None
    candidateLanes: List[str]
    rejectedLanes: List[str]
    reason: str
    confidence: str
    humanConfirmationRequired: bool


class AgentAuthorityBoundary(BaseModel):
    agentId: str
    authorityMode: str
    mayClarify: bool
    mayPrepare: bool
    mayExecute: bool
    mayApprove: bool
    mayDelegate: bool
    requiresHumanApprovalBeforeExecution: bool
    separationOfDutiesRule: str


class ExecutionSubstrate(BaseModel):
    substrateId: str
    substrateKind: str
    displayName: str
    mode: str
    supportsStreaming: bool
    supportsVerificationArtifacts: bool


class CommandEnvelopeExecutor(BaseModel):
    actorType: CommandExecutorType
    agentId: Optional[str] = None
    name: str


class CommandEnvelope(BaseModel):
    preparedByAgentId: str
    intendedExecutor: CommandEnvelopeExecutor
    substrateId: str
    command: str
    arguments: List[str]
    workingDirectory: Optional[str] = None
    riskClass: str
    approvalState: str
    rollbackCommand: Optional[str] = None
    expectedVerification: str


class Stage(BaseModel):
    id: str
    label: str
    status: StageStatus
    reason: Optional[str] = None
    explanation: str
    evidence: List[str]
    rule: str
    next: str


class HumanCheckpoint(BaseModel):
    id: str
    label: str
    state: StepState
    detail: str


class ExecutionStep(BaseModel):
    id: str
    label: str
    state: StepState
    detail: str


class TimelineEvent(BaseModel):
    id: str
    time: str
    title: str
    detail: str
    category: TimelineCategory
    inspectionKey: Optional[str] = None


class InspectionRecord(BaseModel):
    title: str
    content: str


class Playbook(BaseModel):
    name: str
    trigger: str
    preconditions: List[str]
    allowedTools: List[str]
    approvalRequirement: str
    rollback: str


class RuntimeScenario(BaseModel):
    id: str
    label: str
    request: RequestModel
    trustModel: TrustModel
    operators: List[OperatorAgent]
    ownership: OwnershipState
    delegation: DelegationState
    authorityBoundary: AgentAuthorityBoundary
    executionSubstrate: ExecutionSubstrate
    commandEnvelope: CommandEnvelope
    stages: List[Stage]
    humanCheckpoints: List[HumanCheckpoint]
    executionSteps: List[ExecutionStep]
    timeline: List[TimelineEvent]
    inspections: Dict[str, InspectionRecord]
    playbook: Playbook


class ScenarioOption(BaseModel):
    id: str
    label: str


class IntakeRequest(BaseModel):
    source: Literal['slack', 'discord', 'telegram', 'web', 'api']
    userId: Optional[str] = None
    channelId: Optional[str] = None
    rawRequest: str
    requester: str
    normalizedType: str
    targetSystem: str
    requestedEntitlement: Optional[str] = None
    businessReason: Optional[str] = None
    clarificationNeeded: bool = False
    missingFields: List[str] = []
    candidateWorkflows: List[str] = []
    initialTrustMode: str


class IntakeAccepted(BaseModel):
    status: Literal['accepted']
    requestId: str
    scenarioId: str
    clarificationNeeded: bool


MvpTimelineFamily = Literal['intake', 'workflow', 'policy', 'human_checkpoint', 'execution', 'verification', 'artifact', 'trust', 'ownership']


class MvpRequest(BaseModel):
    requestId: str
    source: str
    sourceRef: Optional[str] = None
    title: str
    rawRequest: str
    normalizedRequest: Dict[str, Optional[str] | str | bool | List[str]]
    currentState: str
    currentOwner: str
    workflowCandidate: str
    trustState: str
    delegationMode: str
    createdAt: str
    updatedAt: str


class IntakeStatus(BaseModel):
    intakeState: str
    clarificationNeeded: bool
    missingContext: List[str]
    candidateWorkflows: List[str]
    initialTrustPosture: str


class WorkflowStateSummary(BaseModel):
    state: str
    stateReason: str
    nextStep: str
    blocked: bool
    blockedReason: Optional[str] = None


class PolicyDecisionSummary(BaseModel):
    decision: str
    basis: str
    requiresHumanReview: bool
    policyRef: Optional[str] = None


class TrustStateSummary(BaseModel):
    trustLevel: str
    delegationMode: str
    executionMode: str
    why: str
    downgradeTriggers: List[str]


class PendingActionSummary(BaseModel):
    actionId: str
    actionType: str
    summary: str
    status: str
    preparedBy: str
    requiresApproval: bool
    riskSummary: Optional[str] = None


class VerificationStateSummary(BaseModel):
    status: str
    summary: str
    lastCheckedAt: str
    evidenceRefs: List[str] = []
    failureReason: Optional[str] = None


class ArtifactSummary(BaseModel):
    artifactCount: int
    artifactTypes: List[str]
    highlights: List[str] = []


class MvpTimelineEvent(BaseModel):
    eventId: str
    requestId: str
    family: MvpTimelineFamily
    type: str
    summary: str
    timestamp: str
    actor: str
    details: Optional[Dict[str, str | bool | List[str]]] = None
    correlationId: Optional[str] = None
    artifactRefs: List[str] = []


class RequestSnapshot(BaseModel):
    request: MvpRequest
    intakeStatus: IntakeStatus
    workflowState: WorkflowStateSummary
    policyDecision: PolicyDecisionSummary
    trustState: TrustStateSummary
    pendingAction: PendingActionSummary
    verificationState: VerificationStateSummary
    artifactSummary: ArtifactSummary


class RequestTimelineResponse(BaseModel):
    requestId: str
    events: List[MvpTimelineEvent]


class IntakeExampleFixture(BaseModel):
    exampleId: str
    label: str
    category: str
    rawIntakeMessage: str
    clarification: Dict[str, str | bool | List[str]]
    normalizedN8nOutput: Dict[str, str | bool | List[str] | Dict[str, str]]
    expectedTrustPlane: Dict[str, str]
    expectedTimelineEvents: List[str]
    expectedEvidenceArtifacts: List[str]


class IntakeExampleSummary(BaseModel):
    exampleId: str
    label: str
    category: str
