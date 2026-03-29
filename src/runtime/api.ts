import {
  approveCurrentRequest,
  denyCurrentRequest,
  getRuntimeSnapshot,
  pauseCurrentRequest,
  resumeCurrentRequest,
  setScenario,
} from './store';

function sleep(ms = 120) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchRuntimeSnapshot() {
  await sleep();
  return getRuntimeSnapshot();
}

export async function changeScenario(id: string) {
  await sleep();
  return setScenario(id);
}

export async function approveRuntimeRequest() {
  await sleep();
  return approveCurrentRequest();
}

export async function denyRuntimeRequest() {
  await sleep();
  return denyCurrentRequest();
}

export async function pauseRuntimeRequest() {
  await sleep();
  return pauseCurrentRequest();
}

export async function resumeRuntimeRequest() {
  await sleep();
  return resumeCurrentRequest();
}
