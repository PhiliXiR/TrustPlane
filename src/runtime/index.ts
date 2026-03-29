import { reportingAccessScenario } from './reportingAccessScenario';

export const scenarios = {
  reportingAccess: reportingAccessScenario,
};

export function getDefaultScenario() {
  return scenarios.reportingAccess;
}
