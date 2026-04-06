from copy import deepcopy
from threading import Lock, Thread
from time import sleep
from queue import Queue
from pathlib import Path
import json
from .scenarios import REPORTING_ACCESS, SCENARIOS, get_scenario
from .models import (
    ArtifactSummary,
    IntakeMetadata,
    IntakeRequest,
    IntakeStatus,
    MvpRequest,
    MvpTimelineEvent,
    PendingActionSummary,
    PolicyDecisionSummary,
    RequestSnapshot,
    RequestTimelineResponse,
    RuntimeScenario,
    TrustStateSummary,
    VerificationStateSummary,
    WorkflowStateSummary,
)

_current = deepcopy(REPORTING_ACCESS)
_lock = Lock()
_subscribers = []
_event_counter = 0
_request_counter = 3000
_intake_scenarios = {}
_STORAGE_PATH = Path(__file__).resolve().parent / 'intake-scenarios.json'


def _save_intake_scenarios():
    payload = {
        'requestCounter': _request_counter,
        'scenarios': [scenario.model_dump() for scenario in _intake_scenarios.values()],
    }
    _STORAGE_PATH.write_text(json.dumps(payload, indent=2))


def _load_intake_scenarios():
    global _request_counter, _intake_scenarios
    if not _STORAGE_PATH.exists():
        return
    try:
        payload = json.loads(_STORAGE_PATH.read_text())
        _request_counter = max(int(payload.get('requestCounter', 3000)), 3000)
        loaded = {}
        for item in payload.get('scenarios', []):
            scenario = RuntimeScenario.model_validate(item)
            loaded[scenario.id] = scenario
        _intake_scenarios = loaded
    except Exception:
        _intake_scenarios = {}


_load_intake_scenarios()


def _next_event_id(prefix: str):
    global _event_counter
    _event_counter += 1
    return f"{prefix}_{_event_counter}"


def _next_request_id():
    global _request_counter
    _request_counter += 1
    return f"req_{_request_counter}"


def subscribe_events():
    q = Queue()
    _subscribers.append(q)
    return q


def unsubscribe_events(q):
    if q in _subscribers:
        _subscribers.remove(q)


def _publish(event_type: str, payload: dict):
    event = {"type": event_type, "payload": payload}
    for q in list(_subscribers):
        q.put(event)


def _publish_snapshot():
    _publish("runtime.snapshot", get_runtime_snapshot().model_dump())


def _persist_current_if_intake():
    if _current.id in _intake_scenarios:
        _intake_scenarios[_current.id] = deepcopy(_current)
        _save_intake_scenarios()


def get_runtime_snapshot():
    with _lock:
        return deepcopy(_current)


def _all_scenarios():
    items = {scenario.id: deepcopy(scenario) for scenario in SCENARIOS.values()}
    items.update({scenario.id: deepcopy(scenario) for scenario in _intake_scenarios.values()})
    items[_current.id] = deepcopy(_current)
    return items


def find_scenario_by_request_id(request_id: str):
    with _lock:
        for scenario in _all_scenarios().values():
            if scenario.request.intake and scenario.request.intake.requestId == request_id:
                return deepcopy(scenario)
    return None


def _derive_workflow_state(scenario: RuntimeScenario):
    current_stage = next((stage for stage in scenario.stages if stage.status == 'current'), scenario.stages[-1])
    blocked = current_stage.status == 'blocked' or 'paused' in scenario.request.state.lower() or 'denied' in scenario.request.state.lower()
    blocked_reason = current_stage.reason
    if not blocked_reason and 'approval' in current_stage.label.lower():
        blocked_reason = 'Human review or approval is required before execution can continue.'
    elif not blocked_reason and 'paused' in scenario.request.state.lower():
        blocked_reason = 'The workflow is paused and waiting for operator action.'
    elif not blocked_reason and 'denied' in scenario.request.state.lower():
        blocked_reason = 'The current path was denied and execution cannot continue.'

    return WorkflowStateSummary(
        state=current_stage.id,
        stateReason=current_stage.explanation,
        nextStep=current_stage.next,
        blocked=blocked,
        blockedReason=blocked_reason,
    )


def _derive_policy_decision(scenario: RuntimeScenario):
    policy_stage = next((stage for stage in scenario.stages if stage.id == 'policy'), None)
    approval_required = bool(scenario.authorityBoundary.requiresHumanApprovalBeforeExecution)
    decision = 'held' if approval_required and scenario.commandEnvelope.approvalState not in {'released', 'executed'} else 'allowed'
    if 'denied' in scenario.commandEnvelope.approvalState:
        decision = 'blocked'

    return PolicyDecisionSummary(
        decision=decision,
        basis=policy_stage.explanation if policy_stage else scenario.trustModel.delegationRule,
        requiresHumanReview=approval_required,
        policyRef='policy.derived.from.scenario',
    )


def _derive_execution_mode(scenario: RuntimeScenario):
    mode = scenario.executionSubstrate.mode
    if 'prepared' in mode or scenario.commandEnvelope.approvalState in {'pending', 'not_yet_released', 'held_for_clarification'}:
        return 'prepared_only'
    if scenario.commandEnvelope.approvalState == 'released':
        return 'released_for_execution'
    if scenario.commandEnvelope.approvalState == 'executed':
        return 'executed'
    if 'blocked' in mode:
        return 'blocked'
    return mode


def _derive_trust_state(scenario: RuntimeScenario):
    return TrustStateSummary(
        trustLevel=scenario.trustModel.level.lower(),
        delegationMode=scenario.request.autonomyMode,
        executionMode=_derive_execution_mode(scenario),
        why=scenario.trustModel.delegationRule,
        downgradeTriggers=[scenario.trustModel.downgradeRule],
    )


def _derive_pending_action(scenario: RuntimeScenario):
    current_step = next((step for step in scenario.executionSteps if step.state == 'current'), scenario.executionSteps[-1])
    return PendingActionSummary(
        actionId=f"act_{scenario.id}",
        actionType=current_step.id,
        summary=current_step.detail,
        status=scenario.commandEnvelope.approvalState,
        preparedBy=scenario.commandEnvelope.preparedByAgentId,
        requiresApproval=scenario.authorityBoundary.requiresHumanApprovalBeforeExecution and scenario.commandEnvelope.approvalState not in {'released', 'executed'},
        riskSummary=f"Risk class: {scenario.commandEnvelope.riskClass}",
    )


def _derive_verification_state(scenario: RuntimeScenario):
    verification_stage = next((stage for stage in scenario.stages if stage.id == 'verification'), None)
    status = 'not_started'
    if verification_stage:
        if verification_stage.status == 'current':
            status = 'pending'
        elif verification_stage.status == 'completed':
            status = 'passed'
        elif verification_stage.status == 'blocked':
            status = 'failed'

    if 'verified' in scenario.request.state.lower():
        status = 'passed'
    if 'failed' in scenario.request.state.lower():
        status = 'failed'

    return VerificationStateSummary(
        status=status,
        summary=verification_stage.explanation if verification_stage else scenario.commandEnvelope.expectedVerification,
        lastCheckedAt='now',
        evidenceRefs=['artifact'] if 'artifact' in scenario.inspections else [],
        failureReason=verification_stage.reason if verification_stage and verification_stage.status == 'blocked' else None,
    )


def _derive_artifact_summary(scenario: RuntimeScenario):
    artifact_types = []
    highlights = []
    if 'artifact' in scenario.inspections:
        artifact_types.append('artifact_record')
        highlights.append(scenario.inspections['artifact'].title)
    if scenario.commandEnvelope.rollbackCommand:
        artifact_types.append('rollback_reference')
    if scenario.executionSubstrate.supportsVerificationArtifacts:
        artifact_types.append('verification_artifact')

    return ArtifactSummary(
        artifactCount=len(artifact_types),
        artifactTypes=artifact_types,
        highlights=highlights,
    )


def project_inspection_record(scenario: RuntimeScenario, inspection_key: str | None):
    key = inspection_key or 'request'
    if key in scenario.inspections:
        return deepcopy(scenario.inspections[key])
    if 'artifact' in scenario.inspections:
        return deepcopy(scenario.inspections['artifact'])
    return deepcopy(next(iter(scenario.inspections.values())))


def project_request_snapshot(scenario: RuntimeScenario):
    intake = scenario.request.intake
    request_id = intake.requestId if intake else scenario.id
    source = intake.source if intake else 'runtime'
    raw_request = intake.rawRequest if intake else scenario.request.title
    workflow_candidate = intake.candidateWorkflows[0] if intake and intake.candidateWorkflows else scenario.playbook.name

    return RequestSnapshot(
        request=MvpRequest(
            requestId=request_id,
            source=source,
            sourceRef=(f"{source}:{intake.channelId}:{intake.userId}" if intake and (intake.channelId or intake.userId) else None),
            title=scenario.request.title,
            rawRequest=raw_request,
            normalizedRequest={
                'type': intake.normalizedType if intake else scenario.playbook.name,
                'targetSystem': intake.targetSystem if intake else scenario.executionSubstrate.substrateId,
                'requestedEntitlement': intake.requestedEntitlement if intake else None,
                'businessReason': intake.businessReason if intake else None,
                'clarificationNeeded': intake.clarificationNeeded if intake else False,
                'candidateWorkflows': intake.candidateWorkflows if intake else [scenario.playbook.name],
            },
            currentState=scenario.request.state,
            currentOwner=scenario.ownership.currentOwner.name,
            workflowCandidate=workflow_candidate,
            trustState=scenario.trustModel.level.lower(),
            delegationMode=scenario.request.autonomyMode,
            createdAt='now',
            updatedAt='now',
        ),
        intakeStatus=IntakeStatus(
            intakeState='clarification_needed' if intake and intake.clarificationNeeded else 'normalized',
            clarificationNeeded=intake.clarificationNeeded if intake else False,
            missingContext=intake.missingFields if intake else [],
            candidateWorkflows=intake.candidateWorkflows if intake else [scenario.playbook.name],
            initialTrustPosture=intake.initialTrustMode if intake else scenario.request.autonomyMode,
        ),
        workflowState=_derive_workflow_state(scenario),
        policyDecision=_derive_policy_decision(scenario),
        trustState=_derive_trust_state(scenario),
        pendingAction=_derive_pending_action(scenario),
        verificationState=_derive_verification_state(scenario),
        artifactSummary=_derive_artifact_summary(scenario),
    )


def project_request_timeline(scenario: RuntimeScenario):
    intake = scenario.request.intake
    request_id = intake.requestId if intake else scenario.id
    family_map = {
        'request': 'intake',
        'workflow': 'workflow',
        'policy': 'policy',
        'human': 'human_checkpoint',
        'tool': 'execution',
        'verification': 'verification',
        'artifact': 'artifact',
    }
    actor_map = {
        'request': 'intake',
        'workflow': 'runtime',
        'policy': 'policy',
        'human': 'operator',
        'tool': 'runtime',
        'verification': 'verification',
        'artifact': 'runtime',
    }

    def normalize_type(title: str, family: str):
        lowered = title.lower()
        if family == 'human_checkpoint' and 'approval' in lowered and 'granted' in lowered:
            return 'human.approval.granted'
        if family == 'human_checkpoint' and 'approval' in lowered and 'denied' in lowered:
            return 'human.approval.denied'
        if family == 'human_checkpoint' and 'approval' in lowered and 'requested' in lowered:
            return 'human.approval.requested'
        if family == 'execution' and 'started' in lowered:
            return 'execution.change.started'
        if family == 'execution' and 'completed' in lowered:
            return 'execution.change.completed'
        if family == 'verification' and 'started' in lowered:
            return 'verification.check.started'
        if family == 'verification' and 'completed' in lowered:
            return 'verification.check.passed'
        if family == 'artifact' and 'created' in lowered:
            return 'artifact.created'
        if family == 'workflow' and 'playbook' in lowered:
            return 'workflow.playbook.selected'
        if family == 'ownership' and 'transferred' in lowered:
            return 'ownership.transferred'
        return title

    def infer_actor(event):
        lowered = event.title.lower()
        if 'ownership' in lowered:
            return 'router'
        if 'playbook' in lowered:
            return 'runtime'
        if 'approval' in lowered:
            return 'operator'
        return actor_map.get(event.category, 'runtime')

    events = []
    for event in scenario.timeline:
        family = family_map.get(event.category, 'workflow')
        event_type = normalize_type(event.title, family)
        if event_type == 'ownership.transferred':
            family = 'ownership'
        events.append(
            MvpTimelineEvent(
                eventId=event.id,
                requestId=request_id,
                family=family,
                type=event_type,
                summary=event.detail,
                timestamp=event.time,
                actor=infer_actor(event),
                details={
                    'inspectionKey': event.inspectionKey,
                    'requestState': scenario.request.state,
                } if event.inspectionKey else {'requestState': scenario.request.state},
                artifactRefs=['artifact'] if event.inspectionKey == 'artifact' else [],
            )
        )

    return RequestTimelineResponse(requestId=request_id, events=events)


def set_scenario(scenario_id: str):
    global _current
    with _lock:
        if scenario_id in _intake_scenarios:
            _current = deepcopy(_intake_scenarios[scenario_id])
        else:
            _current = get_scenario(scenario_id)
    _publish_snapshot()
    return get_runtime_snapshot()


def list_runtime_scenarios():
    with _lock:
        base = [{"id": scenario.id, "label": scenario.label} for scenario in SCENARIOS.values()]
        intake = [{"id": scenario.id, "label": scenario.label} for scenario in _intake_scenarios.values()]
    return base + intake


def _append_timeline(title: str, detail: str, category: str, inspection_key: str | None = None):
    global _current
    _current.timeline.append({
        'id': _next_event_id('evt'),
        'time': 'now',
        'title': title,
        'detail': detail,
        'category': category,
        'inspectionKey': inspection_key,
    })


def _run_reporting_access_execution():
    global _current
    steps = [
        ('execution.command.started', 'Executing governed reporting access command...', 'stdout'),
        ('execution.stdout.chunk', 'Resolving current entitlement state for analyst@company', 'stdout'),
        ('execution.stdout.chunk', 'Applying reporting.read grant through governed interface', 'stdout'),
        ('execution.stdout.chunk', 'Grant accepted by target system', 'stdout'),
        ('verification.started', 'Running post-change entitlement verification', 'stdout'),
        ('verification.completed', 'Verified final entitlement state matches requested scope', 'stdout'),
    ]

    for event_type, message, stream in steps:
        sleep(1.0)
        with _lock:
            if event_type == 'execution.command.started':
                _append_timeline('execution.command.started', 'Governed command execution started after approval.', 'tool', 'tool')
            elif event_type == 'verification.started':
                for stage in _current.stages:
                    if stage.id == 'tool':
                        stage.status = 'completed'
                    elif stage.id == 'verification':
                        stage.status = 'current'
                for step in _current.executionSteps:
                    if step.id == 'ex4':
                        step.state = 'completed'
                    elif step.id == 'ex5':
                        step.state = 'current'
                _append_timeline('verification.started', 'Verification started against resulting entitlement state.', 'verification', 'artifact')
            elif event_type == 'verification.completed':
                _current.request.state = 'Completed and verified'
                _current.request.autonomyMode = 'bounded execution completed'
                _current.commandEnvelope.approvalState = 'executed'
                for stage in _current.stages:
                    if stage.id == 'verification':
                        stage.status = 'completed'
                    elif stage.id == 'done':
                        stage.status = 'completed'
                for checkpoint in _current.humanCheckpoints:
                    if checkpoint.id == 'hc3':
                        checkpoint.state = 'completed'
                for step in _current.executionSteps:
                    if step.id == 'ex5':
                        step.state = 'completed'
                _append_timeline('verification.completed', 'Verification passed and completion artifact is ready.', 'verification', 'artifact')
                _current.inspections['artifact'].content = '{\n  "artifactType": "access_change_record",\n  "status": "complete",\n  "verification": "passed",\n  "executedCommand": "reporting-access.grant analyst@company reporting.read"\n}'
            _persist_current_if_intake()
        _publish('execution.stream', {'eventType': event_type, 'stream': stream, 'message': message})
        _publish_snapshot()


def create_intake_request(intake: IntakeRequest):
    global _current
    request_id = _next_request_id()
    scenario = deepcopy(REPORTING_ACCESS)

    title = f"{intake.normalizedType.replace('_', ' ').title()} · {intake.targetSystem}"
    requested_entitlement = intake.requestedEntitlement or 'unspecified'
    business_reason = intake.businessReason or 'not yet provided'
    workflow_name = intake.candidateWorkflows[0] if intake.candidateWorkflows else 'unclassified_intake'
    selected_lane = 'access' if intake.normalizedType == 'access_request' else 'change'
    selected_agent = 'access-operator' if selected_lane == 'access' else 'change-operator'
    selected_agent_name = 'Access Operator' if selected_lane == 'access' else 'Change Operator'
    current_state = 'Clarification required before governed intake' if intake.clarificationNeeded else 'Received from intake and awaiting governed review'
    current_stage = 'intake' if intake.clarificationNeeded else 'classification'
    trust_level = 'Restricted' if intake.clarificationNeeded else 'Moderate'

    scenario.id = f"intake-{request_id}"
    scenario.label = f"Intake · {intake.targetSystem}"
    scenario.request.title = title
    scenario.request.state = current_state
    scenario.request.owner = 'Intake Bot' if intake.clarificationNeeded else selected_agent_name
    scenario.request.risk = 'medium' if intake.normalizedType == 'access_request' else 'unknown'
    scenario.request.autonomyMode = intake.initialTrustMode.replace('_', '-')
    scenario.request.intake = IntakeMetadata(
        requestId=request_id,
        source=intake.source,
        requester=intake.requester,
        rawRequest=intake.rawRequest,
        normalizedType=intake.normalizedType,
        targetSystem=intake.targetSystem,
        requestedEntitlement=intake.requestedEntitlement,
        businessReason=intake.businessReason,
        clarificationNeeded=intake.clarificationNeeded,
        missingFields=intake.missingFields,
        candidateWorkflows=intake.candidateWorkflows,
        initialTrustMode=intake.initialTrustMode,
        userId=intake.userId,
        channelId=intake.channelId,
    )

    scenario.trustModel.level = trust_level
    scenario.trustModel.currentBoundary = (
        f"Delegation mode: {intake.initialTrustMode.replace('_', ' ')} · "
        + ('Execution mode: clarification held' if intake.clarificationNeeded else 'Execution mode: intake accepted, no execution authority')
    )
    scenario.trustModel.delegationRule = (
        'The runtime may capture and normalize the request, but it may not proceed until missing context is resolved.'
        if intake.clarificationNeeded
        else 'The runtime may classify and route the request, but execution authority remains gated behind later policy and approval checks.'
    )
    scenario.trustModel.downgradeRule = 'If clarification remains unresolved or later policy checks fail, the request stays human-controlled and cannot advance into execution.'

    scenario.operators = [
        {
            'agentId': 'intake',
            'name': 'Intake Bot',
            'kind': 'intake-agent',
            'lane': 'intake',
            'runtime': 'nemoclaw',
            'workspace': '~/.openclaw/workspaces/intake-bot',
            'sessionType': 'persistent',
            'authorityProfile': 'clarify_and_route_only',
            'allowedSubstrates': ['openclaw-routing'],
            'status': 'active' if intake.clarificationNeeded else 'completed_handoff',
        },
        {
            'agentId': selected_agent,
            'name': selected_agent_name,
            'kind': 'operator-agent',
            'lane': selected_lane,
            'runtime': 'nemoclaw',
            'workspace': f'~/.openclaw/workspaces/{selected_agent}',
            'sessionType': 'persistent',
            'authorityProfile': 'bounded_access_changes' if selected_lane == 'access' else 'prepare_high_risk_change_and_execute_after_release',
            'allowedSubstrates': ['openclaw-tools'] if selected_lane == 'access' else ['openshell'],
            'status': 'waiting_for_routing' if intake.clarificationNeeded else 'queued',
        },
    ]

    scenario.ownership = {
        'currentOwner': {
            'actorType': 'intake-agent' if intake.clarificationNeeded else 'operator-agent',
            'agentId': 'intake' if intake.clarificationNeeded else selected_agent,
            'name': 'Intake Bot' if intake.clarificationNeeded else selected_agent_name,
            'lane': 'intake' if intake.clarificationNeeded else selected_lane,
        },
        'previousOwner': None if intake.clarificationNeeded else {
            'actorType': 'intake-agent',
            'agentId': 'intake',
            'name': 'Intake Bot',
            'lane': 'intake',
        },
        'assignedAt': 'now',
        'ownershipReason': (
            'The request remains with Intake Bot until missing intake fields are resolved.'
            if intake.clarificationNeeded
            else f'NemoClaw routed the normalized request to {selected_agent_name} after matching lane {selected_lane}.'
        ),
    }

    scenario.delegation = {
        'delegationMode': 'held_for_clarification' if intake.clarificationNeeded else 'automatic',
        'routingComponent': 'nemoclaw-request-router',
        'selectedLane': 'intake' if intake.clarificationNeeded else selected_lane,
        'selectedAgentId': None if intake.clarificationNeeded else selected_agent,
        'candidateLanes': ['access'] if intake.normalizedType == 'access_request' else ['change'],
        'rejectedLanes': ['endpoint'],
        'reason': (
            f'Routing is paused until missing fields are resolved: {", ".join(intake.missingFields)}.'
            if intake.clarificationNeeded and intake.missingFields
            else f'The request matches lane {selected_lane} based on normalized type and target system.'
        ),
        'confidence': 'low' if intake.clarificationNeeded else 'high',
        'humanConfirmationRequired': False,
    }

    scenario.authorityBoundary = {
        'agentId': 'intake' if intake.clarificationNeeded else selected_agent,
        'authorityMode': 'clarify_only' if intake.clarificationNeeded else 'prepare_only_until_policy_and_approval',
        'mayClarify': True if intake.clarificationNeeded else False,
        'mayPrepare': False if intake.clarificationNeeded else True,
        'mayExecute': False,
        'mayApprove': False,
        'mayDelegate': False,
        'requiresHumanApprovalBeforeExecution': True,
        'separationOfDutiesRule': 'Intake may not self-route past unresolved ambiguity; operator execution remains gated behind policy and approval.',
    }

    substrate_id = 'openclaw-tools' if selected_lane == 'access' else 'openshell'
    scenario.executionSubstrate = {
        'substrateId': substrate_id,
        'substrateKind': 'openclaw-tools' if selected_lane == 'access' else 'command-runtime',
        'displayName': 'OpenClaw Governed Tools' if selected_lane == 'access' else 'NVIDIA OpenShell',
        'mode': 'not_released',
        'supportsStreaming': True,
        'supportsVerificationArtifacts': True,
    }

    scenario.commandEnvelope = {
        'preparedByAgentId': 'intake' if intake.clarificationNeeded else selected_agent,
        'intendedExecutor': {
            'actorType': 'operator-agent',
            'agentId': selected_agent,
            'name': selected_agent_name,
        },
        'substrateId': substrate_id,
        'command': (
            f'grant-access --system {intake.targetSystem} --entitlement {requested_entitlement} --user {intake.requester}'
            if selected_lane == 'access'
            else f'change-system --target {intake.targetSystem} --request {request_id}'
        ),
        'arguments': (
            ['--system', intake.targetSystem, '--entitlement', requested_entitlement, '--user', intake.requester]
            if selected_lane == 'access'
            else ['--target', intake.targetSystem, '--request', request_id]
        ),
        'workingDirectory': f'/opt/trustplane/runtime/{selected_agent}',
        'riskClass': scenario.request.risk,
        'approvalState': 'held_for_clarification' if intake.clarificationNeeded else 'not_yet_released',
        'rollbackCommand': None if intake.clarificationNeeded else f'rollback --request {request_id}',
        'expectedVerification': 'normalized_request_classified_and_execution_envelope_prepared',
    }

    for stage in scenario.stages:
        if stage.id == 'submitted':
            stage.status = 'completed'
            stage.explanation = f"Request entered TrustPlane from {intake.source} intake."
            stage.evidence = [
                f"requestId={request_id}",
                f"source={intake.source}",
                f"requester={intake.requester}",
            ]
            stage.next = 'The intake agent records the raw request and attempts normalization.'
        elif stage.id == 'intake':
            stage.status = 'current' if current_stage == 'intake' else 'completed'
            stage.explanation = (
                'The intake agent requires additional clarification before the request can move into governed classification.'
                if intake.clarificationNeeded
                else 'The intake agent normalized the incoming request into a governed intake object.'
            )
            stage.evidence = [
                f"normalizedType={intake.normalizedType}",
                f"targetSystem={intake.targetSystem}",
                f"requestedEntitlement={requested_entitlement}",
                f"clarificationNeeded={str(intake.clarificationNeeded).lower()}",
            ] + [f"missingField={field}" for field in intake.missingFields]
            stage.next = (
                'The requester must supply the missing context before classification can continue.'
                if intake.clarificationNeeded
                else 'Classification can now determine the workflow family and ownership lane.'
            )
        elif stage.id == 'classification':
            stage.status = 'current' if current_stage == 'classification' else 'future'
            stage.explanation = (
                'Classification is blocked until required intake fields are present.'
                if intake.clarificationNeeded
                else 'The request is ready for workflow classification and governed ownership assignment.'
            )
            stage.evidence = [
                f"candidateWorkflow={workflow_name}",
                f"businessReason={business_reason}",
            ]
            stage.next = (
                'Resolve missing fields before selecting a workflow.'
                if intake.clarificationNeeded
                else 'A governed workflow can now be selected for this request family.'
            )
        elif stage.id in {'playbook', 'policy', 'approval', 'tool', 'verification', 'done'}:
            stage.status = 'future'
            stage.reason = 'Awaiting earlier intake/classification work'

    scenario.humanCheckpoints = [
        {
            'id': 'hc1',
            'label': 'Intake captured',
            'state': 'completed',
            'detail': f'The request was captured from {intake.source} and attached to requester {intake.requester}.',
        },
        {
            'id': 'hc2',
            'label': 'Clarification status',
            'state': 'current',
            'detail': (
                f"Missing fields: {', '.join(intake.missingFields)}"
                if intake.clarificationNeeded and intake.missingFields
                else 'No clarification is currently required at intake.'
            ),
        },
        {
            'id': 'hc3',
            'label': 'Governed routing',
            'state': 'upcoming',
            'detail': 'After intake review, the request can move into workflow classification and trust-bound routing.',
        },
    ]

    scenario.executionSteps = [
        {
            'id': 'ex1',
            'label': 'Capture raw request',
            'state': 'completed',
            'detail': 'The source message and requester metadata were captured from the intake surface.',
        },
        {
            'id': 'ex2',
            'label': 'Normalize intake payload',
            'state': 'completed',
            'detail': 'The request was shaped into the TrustPlane intake contract.',
        },
        {
            'id': 'ex3',
            'label': 'Hold for clarification or classification',
            'state': 'current',
            'detail': (
                'The request is waiting for missing intake details.'
                if intake.clarificationNeeded
                else 'The request is ready for classification; no execution authority exists yet.'
            ),
        },
        {
            'id': 'ex4',
            'label': 'Select governed workflow',
            'state': 'upcoming',
            'detail': 'A candidate workflow will be chosen once intake is accepted.',
        },
        {
            'id': 'ex5',
            'label': 'Prepare downstream audit trail',
            'state': 'upcoming',
            'detail': 'Audit evidence will accumulate as the request advances beyond intake.',
        },
    ]

    scenario.timeline = [
        {
            'id': 't1',
            'time': 'now',
            'title': 'workflow.entered_queue',
            'detail': f'Request entered TrustPlane from {intake.source}.',
            'category': 'request',
            'inspectionKey': 'request',
        },
        {
            'id': 't2',
            'time': 'now',
            'title': 'workflow.intake.captured',
            'detail': f'Intake payload recorded for requester {intake.requester}.',
            'category': 'workflow',
            'inspectionKey': 'request',
        },
        {
            'id': 't3',
            'time': 'now',
            'title': 'workflow.intake.normalized',
            'detail': f'Normalized type {intake.normalizedType} targeting {intake.targetSystem}.',
            'category': 'workflow',
            'inspectionKey': 'request',
        },
        {
            'id': 't4',
            'time': 'now',
            'title': 'human.clarification.requested' if intake.clarificationNeeded else 'ownership.transferred',
            'detail': (
                f"Clarification needed for fields: {', '.join(intake.missingFields)}."
                if intake.clarificationNeeded and intake.missingFields
                else f'Request ownership transferred to {selected_agent_name} after NemoClaw routing.'
            ),
            'category': 'human' if intake.clarificationNeeded else 'workflow',
            'inspectionKey': 'policy' if intake.clarificationNeeded else 'playbook',
        },
    ]

    scenario.inspections = {
        'request': {
            'title': 'Raw intake request',
            'content': json.dumps({
                'requestId': request_id,
                'source': intake.source,
                'userId': intake.userId,
                'channelId': intake.channelId,
                'rawRequest': intake.rawRequest,
                'requester': intake.requester,
                'normalizedType': intake.normalizedType,
                'targetSystem': intake.targetSystem,
                'requestedEntitlement': intake.requestedEntitlement,
                'businessReason': intake.businessReason,
                'clarificationNeeded': intake.clarificationNeeded,
                'missingFields': intake.missingFields,
                'candidateWorkflows': intake.candidateWorkflows,
                'initialTrustMode': intake.initialTrustMode,
            }, indent=2),
        },
        'tool': {
            'title': 'Execution envelope preview',
            'content': json.dumps({
                'substrate': scenario.executionSubstrate['displayName'],
                'status': scenario.commandEnvelope['approvalState'],
                'command': scenario.commandEnvelope['command'],
                'rollbackCommand': scenario.commandEnvelope['rollbackCommand'],
            }, indent=2),
        },
        'policy': {
            'title': 'Intake policy notes',
            'content': json.dumps({
                'initialTrustMode': intake.initialTrustMode,
                'clarificationNeeded': intake.clarificationNeeded,
                'missingFields': intake.missingFields,
                'decision': 'hold_for_clarification' if intake.clarificationNeeded else 'ready_for_classification',
            }, indent=2),
        },
        'playbook': {
            'title': 'Workflow candidacy',
            'content': json.dumps({
                'candidateWorkflows': intake.candidateWorkflows,
                'selectedWorkflow': None,
                'status': 'pending_classification',
            }, indent=2),
        },
        'artifact': {
            'title': 'Artifact preview',
            'content': json.dumps({
                'artifactType': 'intake_record',
                'status': 'captured',
                'willInclude': [
                    'source metadata',
                    'raw request',
                    'normalized request',
                    'clarification status',
                    'workflow candidacy',
                ],
            }, indent=2),
        },
    }

    scenario.playbook.name = workflow_name
    scenario.playbook.trigger = f"Intake request for {intake.targetSystem} from {intake.source}"
    scenario.playbook.preconditions = [
        'Requester identity is attached or recoverable',
        'Raw request text is preserved',
        'Normalization step completed',
    ]
    scenario.playbook.allowedTools = ['intake.capture', 'intake.normalize']
    scenario.playbook.approvalRequirement = 'No execution approval path yet; request must first pass intake/classification.'
    scenario.playbook.rollback = 'Invalidate the intake record or request more context before downstream routing.'

    with _lock:
        _current = scenario
        _intake_scenarios[scenario.id] = deepcopy(scenario)
        _append_timeline('artifact.created', 'Intake record created and projected into TrustPlane runtime view.', 'artifact', 'artifact')
        _persist_current_if_intake()
    _publish_snapshot()
    return {'requestId': request_id, 'scenarioId': scenario.id, 'clarificationNeeded': intake.clarificationNeeded}


def approve_current_request():
    global _current
    with _lock:
        _current = deepcopy(_current)
        _current.request.state = 'Governed execution authorized'
        _current.request.autonomyMode = 'bounded execution window'
        _current.trustModel.level = 'Elevated'
        _current.trustModel.currentBoundary = 'Delegation mode: Bounded autonomous execution · Execution mode: Runtime executed'
        _current.trustModel.delegationRule = 'The runtime may now issue the prepared action within the approved playbook boundaries.'
        _current.commandEnvelope.approvalState = 'released'
        for stage in _current.stages:
            if stage.id == 'approval':
                stage.status = 'completed'
                stage.reason = None
            elif stage.id == 'tool':
                stage.status = 'current'
        for checkpoint in _current.humanCheckpoints:
            if checkpoint.id == 'hc2':
                checkpoint.state = 'completed'
            elif checkpoint.id == 'hc3':
                checkpoint.state = 'current'
        for step in _current.executionSteps:
            if step.id == 'ex3':
                step.state = 'completed'
            elif step.id == 'ex4':
                step.state = 'current'
        _append_timeline('human.approval.granted', 'Operator approved the governed action and released execution authority to the runtime.', 'human', 'policy')
        _append_timeline('execution.change.started', 'The governed runtime began issuing the prepared tool request within approved bounds.', 'tool', 'tool')
        _persist_current_if_intake()
    _publish_snapshot()
    if get_runtime_snapshot().id == 'reporting-access':
        Thread(target=_run_reporting_access_execution, daemon=True).start()
    return get_runtime_snapshot()


def deny_current_request():
    global _current
    with _lock:
        _current = deepcopy(_current)
        _current.request.state = 'Denied and held for human follow-up'
        _current.request.autonomyMode = 'human-controlled'
        _current.trustModel.level = 'Restricted'
        _current.trustModel.currentBoundary = 'Delegation mode: Suspended / downgraded · Execution mode: Execution blocked'
        _current.trustModel.delegationRule = 'The runtime may not execute or continue the staged action after denial.'
        _current.commandEnvelope.approvalState = 'denied'
        for stage in _current.stages:
            if stage.id == 'approval':
                stage.status = 'blocked'
                stage.reason = 'Denied by operator'
            elif stage.id in {'tool', 'verification', 'done'}:
                stage.status = 'future'
        _append_timeline('human.approval.denied', 'Operator denied the staged action. Runtime execution authority has been revoked.', 'human', 'policy')
        _persist_current_if_intake()
    _publish_snapshot()
    return get_runtime_snapshot()


def pause_current_request():
    global _current
    with _lock:
        _current = deepcopy(_current)
        _current.request.state = 'Paused for operator review'
        _append_timeline('workflow.paused', 'Operator paused the workflow pending additional review.', 'human', 'request')
        _persist_current_if_intake()
    _publish_snapshot()
    return get_runtime_snapshot()


def resume_current_request():
    global _current
    with _lock:
        _current = deepcopy(_current)
        _append_timeline('workflow.resumed', 'Operator resumed the workflow.', 'human', 'request')
        _persist_current_if_intake()
    _publish_snapshot()
    return get_runtime_snapshot()


def _run_openshell_execution():
    global _current
    steps = [
        ('execution.command.started', 'Dispatching approved OpenShell command envelope...', 'stdout'),
        ('execution.stdout.chunk', 'OpenShell: loading staged command profile vendor-nightly', 'stdout'),
        ('execution.stdout.chunk', 'OpenShell: applying VPN policy delta for 203.0.113.10/32', 'stdout'),
        ('execution.stdout.chunk', 'OpenShell: command completed successfully', 'stdout'),
        ('verification.started', 'Reading back resulting VPN policy state', 'stdout'),
        ('verification.completed', 'Verified OpenShell-applied policy matches staged desired state', 'stdout'),
    ]

    for event_type, message, stream in steps:
        sleep(1.0)
        with _lock:
            if event_type == 'execution.command.started':
                _append_timeline('execution.command.dispatched', 'Approved OpenShell command envelope dispatched by the change operator.', 'tool', 'tool')
            elif event_type == 'verification.started':
                for stage in _current.stages:
                    if stage.id == 'tool':
                        stage.status = 'completed'
                    elif stage.id == 'verification':
                        stage.status = 'current'
                _append_timeline('verification.started', 'Verification started after OpenShell command completion.', 'verification', 'artifact')
            elif event_type == 'verification.completed':
                _current.request.state = 'Completed and verified'
                _current.commandEnvelope.approvalState = 'executed'
                for stage in _current.stages:
                    if stage.id == 'verification':
                        stage.status = 'completed'
                    elif stage.id == 'done':
                        stage.status = 'completed'
                _append_timeline('verification.completed', 'Verification passed and OpenShell execution artifact is ready.', 'verification', 'artifact')
            _persist_current_if_intake()
        _publish('execution.stream', {'eventType': event_type, 'stream': stream, 'message': message})
        _publish_snapshot()


def release_execution_authority():
    global _current
    with _lock:
        _current = deepcopy(_current)
        _current.request.state = 'Execution authority released to current operator'
        _current.commandEnvelope.approvalState = 'released'
        _current.authorityBoundary.mayExecute = True
        _current.executionSubstrate.mode = 'released_for_execution'
        if _current.operators:
            for operator in _current.operators:
                if operator.agentId == _current.ownership.currentOwner.agentId:
                    operator.status = 'execution_released'
        _append_timeline('agent.authority.released_for_execution', 'Execution authority was explicitly released to the current operator agent.', 'tool', 'tool')
        _persist_current_if_intake()
    _publish_snapshot()
    current = get_runtime_snapshot()
    if current.executionSubstrate.substrateId == 'openshell':
        Thread(target=_run_openshell_execution, daemon=True).start()
    elif current.id == 'reporting-access':
        Thread(target=_run_reporting_access_execution, daemon=True).start()
    return get_runtime_snapshot()
