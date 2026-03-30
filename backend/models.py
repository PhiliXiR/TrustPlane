from pydantic import BaseModel
from typing import Dict, List, Literal, Optional

StageStatus = Literal['completed', 'current', 'future', 'blocked']
TimelineCategory = Literal['request', 'workflow', 'policy', 'human', 'tool', 'verification', 'artifact']
StepState = Literal['completed', 'current', 'upcoming']


class RequestModel(BaseModel):
    title: str
    state: str
    owner: str
    risk: str
    autonomyMode: str


class TrustModel(BaseModel):
    level: str
    currentBoundary: str
    delegationRule: str
    downgradeRule: str


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
