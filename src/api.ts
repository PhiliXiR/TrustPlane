import type { RuntimeScenario } from './runtime/scenarioTypes';

const API_BASE = 'http://127.0.0.1:8011';

async function call<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`TrustPlane API ${path} failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchRuntimeSnapshot() {
  return call<RuntimeScenario>('/api/runtime');
}

export function changeScenario(id: string) {
  return call<RuntimeScenario>(`/api/runtime/scenario/${id}`, { method: 'POST' });
}

export function approveRuntimeRequest() {
  return call<RuntimeScenario>('/api/runtime/approve', { method: 'POST' });
}

export function denyRuntimeRequest() {
  return call<RuntimeScenario>('/api/runtime/deny', { method: 'POST' });
}

export function pauseRuntimeRequest() {
  return call<RuntimeScenario>('/api/runtime/pause', { method: 'POST' });
}

export function resumeRuntimeRequest() {
  return call<RuntimeScenario>('/api/runtime/resume', { method: 'POST' });
}
