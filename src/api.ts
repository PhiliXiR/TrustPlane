import type { RuntimeScenario } from './runtime/scenarioTypes';
import type { RequestSnapshot, RequestTimelineResponse } from './runtime/requestTypes';

export type RequestActionKind = 'approve' | 'deny' | 'pause' | 'resume' | 'release-execution';

const API_BASE = import.meta.env.VITE_TRUSTPLANE_API_BASE ?? 'http://127.0.0.1:8011';
const EVENTS_URL = `${API_BASE}/api/events`;

type ScenarioOption = { id: string; label: string };

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

export function fetchScenarioOptions() {
  return call<ScenarioOption[]>('/api/scenarios');
}

export function fetchRuntimeSnapshot() {
  return call<RuntimeScenario>('/api/runtime');
}

export function fetchRequestSnapshot(requestId: string) {
  return call<RequestSnapshot>(`/api/requests/${requestId}`);
}

export function fetchRequestTimeline(requestId: string) {
  return call<RequestTimelineResponse>(`/api/requests/${requestId}/timeline`);
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

export function releaseExecutionAuthority() {
  return call<RuntimeScenario>('/api/runtime/release-execution', { method: 'POST' });
}

export function performRequestAction(requestId: string, action: RequestActionKind) {
  return call<RuntimeScenario>(`/api/requests/${requestId}/${action}`, { method: 'POST' });
}

export function getEventsUrl() {
  return EVENTS_URL;
}

export function getRequestEventsUrl(requestId: string) {
  return `${API_BASE}/api/requests/${requestId}/stream`;
}
