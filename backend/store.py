from copy import deepcopy
from threading import Lock, Thread
from time import sleep
from queue import Queue
import json
from .scenarios import REPORTING_ACCESS, get_scenario
from .models import IntakeMetadata, IntakeRequest

_current = deepcopy(REPORTING_ACCESS)
_lock = Lock()
_subscribers = []
_event_counter = 0
_request_counter = 3000


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


def get_runtime_snapshot():
    with _lock:
        return deepcopy(_current)


def set_scenario(scenario_id: str):
    global _current
    with _lock:
        _current = get_scenario(scenario_id)
    _publish_snapshot()
    return get_runtime_snapshot()


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
    current_state = 'Clarification required before governed intake' if intake.clarificationNeeded else 'Received from intake and awaiting governed review'
    current_stage = 'intake' if intake.clarificationNeeded else 'classification'
    trust_level = 'Restricted' if intake.clarificationNeeded else 'Moderate'

    scenario.id = f"intake-{request_id}"
    scenario.label = f"Intake · {intake.targetSystem}"
    scenario.request.title = title
    scenario.request.state = current_state
    scenario.request.owner = 'Intake Agent'
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
            'title': 'human.clarification.requested' if intake.clarificationNeeded else 'workflow.classification.pending',
            'detail': (
                f"Clarification needed for fields: {', '.join(intake.missingFields)}."
                if intake.clarificationNeeded and intake.missingFields
                else 'Request is ready for governed classification.'
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
                'status': 'not_prepared',
                'reason': 'No execution envelope exists yet. Intake has not advanced beyond governed classification.',
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
        _append_timeline('artifact.created', 'Intake record created and projected into TrustPlane runtime view.', 'artifact', 'artifact')
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
        for stage in _current.stages:
            if stage.id == 'approval':
                stage.status = 'blocked'
                stage.reason = 'Denied by operator'
            elif stage.id in {'tool', 'verification', 'done'}:
                stage.status = 'future'
        _append_timeline('human.approval.denied', 'Operator denied the staged action. Runtime execution authority has been revoked.', 'human', 'policy')
    _publish_snapshot()
    return get_runtime_snapshot()


def pause_current_request():
    global _current
    with _lock:
        _current = deepcopy(_current)
        _current.request.state = 'Paused for operator review'
        _append_timeline('workflow.paused', 'Operator paused the workflow pending additional review.', 'human', 'request')
    _publish_snapshot()
    return get_runtime_snapshot()


def resume_current_request():
    global _current
    with _lock:
        _current = deepcopy(_current)
        _append_timeline('workflow.resumed', 'Operator resumed the workflow.', 'human', 'request')
    _publish_snapshot()
    return get_runtime_snapshot()
