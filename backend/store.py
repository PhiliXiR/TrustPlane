from copy import deepcopy
from .scenarios import REPORTING_ACCESS, get_scenario

_current = deepcopy(REPORTING_ACCESS)


def get_runtime_snapshot():
    return deepcopy(_current)


def set_scenario(scenario_id: str):
    global _current
    _current = get_scenario(scenario_id)
    return get_runtime_snapshot()


def approve_current_request():
    global _current
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
    _current.timeline.append({
        'id': 'evt_approve',
        'time': 'now',
        'title': 'human.approval.granted',
        'detail': 'Operator approved the governed action and released execution authority to the runtime.',
        'category': 'human',
        'inspectionKey': 'policy',
    })
    _current.timeline.append({
        'id': 'evt_exec',
        'time': 'now',
        'title': 'execution.change.started',
        'detail': 'The governed runtime began issuing the prepared tool request within approved bounds.',
        'category': 'tool',
        'inspectionKey': 'tool',
    })
    return get_runtime_snapshot()


def deny_current_request():
    global _current
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
    _current.timeline.append({
        'id': 'evt_deny',
        'time': 'now',
        'title': 'human.approval.denied',
        'detail': 'Operator denied the staged action. Runtime execution authority has been revoked.',
        'category': 'human',
        'inspectionKey': 'policy',
    })
    return get_runtime_snapshot()


def pause_current_request():
    global _current
    _current = deepcopy(_current)
    _current.request.state = 'Paused for operator review'
    _current.timeline.append({
        'id': 'evt_pause',
        'time': 'now',
        'title': 'workflow.paused',
        'detail': 'Operator paused the workflow pending additional review.',
        'category': 'human',
        'inspectionKey': 'request',
    })
    return get_runtime_snapshot()


def resume_current_request():
    global _current
    _current = deepcopy(_current)
    _current.timeline.append({
        'id': 'evt_resume',
        'time': 'now',
        'title': 'workflow.resumed',
        'detail': 'Operator resumed the workflow.',
        'category': 'human',
        'inspectionKey': 'request',
    })
    return get_runtime_snapshot()
