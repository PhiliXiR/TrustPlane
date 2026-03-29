import { reportingAccessScenario } from './reportingAccessScenario';
import { vpnPolicyScenario } from './vpnPolicyScenario';

export const scenarios = {
  reportingAccess: reportingAccessScenario,
  vpnPolicyChange: vpnPolicyScenario,
};

export function getDefaultScenario() {
  return scenarios.reportingAccess;
}

export function getScenarioOptions() {
  return Object.values(scenarios).map((scenario) => ({ id: scenario.id, label: scenario.label }));
}

export function getScenarioById(id: string) {
  return Object.values(scenarios).find((scenario) => scenario.id === id) ?? getDefaultScenario();
}
