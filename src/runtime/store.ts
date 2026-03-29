import { getDefaultScenario, getScenarioById } from './index';
import type { RuntimeScenario } from './scenarioTypes';

let currentScenario: RuntimeScenario = structuredClone(getDefaultScenario());

function cloneScenario<T>(value: T): T {
  return structuredClone(value);
}

export function getRuntimeSnapshot() {
  return cloneScenario(currentScenario);
}

export function setScenario(id: string) {
  currentScenario = cloneScenario(getScenarioById(id));
  return getRuntimeSnapshot();
}

export function approveCurrentRequest() {
  currentScenario = cloneScenario(currentScenario);
  currentScenario.request.state = 'Governed execution authorized';
  currentScenario.request.autonomyMode = 'bounded execution window';
  currentScenario.trustModel.level = 'Level 2 — Bounded execution';
  currentScenario.trustModel.currentBoundary = 'Execution authorized inside governed runtime envelope';
  currentScenario.trustModel.delegationRule = 'The runtime may now issue the prepared action within the approved playbook boundaries.';
  currentScenario.stages = currentScenario.stages.map((stage) => {
    if (stage.id === 'approval') return { ...stage, status: 'completed' };
    if (stage.id === 'tool') return { ...stage, status: 'current' };
    return stage;
  });
  currentScenario.humanCheckpoints = currentScenario.humanCheckpoints.map((checkpoint) => {
    if (checkpoint.id === 'hc2') return { ...checkpoint, state: 'completed' };
    if (checkpoint.id === 'hc3') return { ...checkpoint, state: 'current' };
    return checkpoint;
  });
  currentScenario.executionSteps = currentScenario.executionSteps.map((step) => {
    if (step.id === 'ex3') return { ...step, state: 'completed' };
    if (step.id === 'ex4') return { ...step, state: 'current' };
    return step;
  });
  currentScenario.timeline = [
    ...currentScenario.timeline,
    {
      id: `evt_${Date.now()}`,
      time: 'now',
      title: 'human.approval.granted',
      detail: 'Operator approved the governed action and released execution authority to the runtime.',
      category: 'human',
      inspectionKey: 'policy',
    },
    {
      id: `evt_exec_${Date.now()}`,
      time: 'now',
      title: 'execution.change.started',
      detail: 'The governed runtime began issuing the prepared tool request within approved bounds.',
      category: 'tool',
      inspectionKey: 'tool',
    },
  ];
  return getRuntimeSnapshot();
}

export function denyCurrentRequest() {
  currentScenario = cloneScenario(currentScenario);
  currentScenario.request.state = 'Denied and held for human follow-up';
  currentScenario.request.autonomyMode = 'human-controlled';
  currentScenario.trustModel.level = 'Level 0 — Observe and review';
  currentScenario.trustModel.currentBoundary = 'Execution authority removed after denial';
  currentScenario.trustModel.delegationRule = 'The runtime may not execute or continue the staged action after denial.';
  currentScenario.stages = currentScenario.stages.map((stage) => {
    if (stage.id === 'approval') return { ...stage, status: 'blocked', reason: 'Denied by operator' };
    if (stage.id === 'tool' || stage.id === 'verification' || stage.id === 'done') return { ...stage, status: 'future' };
    return stage;
  });
  currentScenario.timeline = [
    ...currentScenario.timeline,
    {
      id: `evt_${Date.now()}`,
      time: 'now',
      title: 'human.approval.denied',
      detail: 'Operator denied the staged action. Runtime execution authority has been revoked.',
      category: 'human',
      inspectionKey: 'policy',
    },
  ];
  return getRuntimeSnapshot();
}

export function pauseCurrentRequest() {
  currentScenario = cloneScenario(currentScenario);
  currentScenario.request.state = 'Paused for operator review';
  currentScenario.timeline = [
    ...currentScenario.timeline,
    {
      id: `evt_${Date.now()}`,
      time: 'now',
      title: 'workflow.paused',
      detail: 'Operator paused the workflow pending additional review.',
      category: 'human',
      inspectionKey: 'request',
    },
  ];
  return getRuntimeSnapshot();
}

export function resumeCurrentRequest() {
  currentScenario = cloneScenario(currentScenario);
  currentScenario.request.state = currentScenario.request.autonomyMode === 'human-controlled'
    ? 'Awaiting operator decision'
    : currentScenario.request.state;
  currentScenario.timeline = [
    ...currentScenario.timeline,
    {
      id: `evt_${Date.now()}`,
      time: 'now',
      title: 'workflow.resumed',
      detail: 'Operator resumed the workflow.',
      category: 'human',
      inspectionKey: 'request',
    },
  ];
  return getRuntimeSnapshot();
}
