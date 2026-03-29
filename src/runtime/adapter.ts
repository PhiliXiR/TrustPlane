import { getDefaultScenario, getScenarioById } from './index';

export function loadRuntimeSnapshot(scenarioId?: string) {
  if (!scenarioId) return getDefaultScenario();
  return getScenarioById(scenarioId);
}
