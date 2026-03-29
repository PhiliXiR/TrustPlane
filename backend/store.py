from copy import deepcopy
from threading import Lock, Thread
from time import sleep
from queue import Queue
from .scenarios import REPORTING_ACCESS, get_scenario

_current = deepcopy(REPORTING_ACCESS)
_lock = Lock()
_subscribers = []
_event_counter = 0


def _next_event_id(prefix: str):
    global _event_counter
    _event_counter += 1
    return f"{prefix}_{_event_counter}"


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
