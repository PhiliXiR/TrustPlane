import { useEffect, useMemo, useState } from 'react';
import { ApprovalBar } from './components/ApprovalBar';
import { DecisionPanel } from './components/DecisionPanel';
import { ExecutionTracePanel } from './components/ExecutionTracePanel';
import { HumanCheckpointsPanel } from './components/HumanCheckpointsPanel';
import { InspectionDrawer } from './components/InspectionDrawer';
import { PlaybookCard } from './components/PlaybookCard';
import { RequestHeader } from './components/RequestHeader';
import { ScenarioSelector } from './components/ScenarioSelector';
import { TimelinePanel } from './components/TimelinePanel';
import { WorkflowRail } from './components/WorkflowRail';
import { getScenarioOptions } from './runtime';
import {
  approveRuntimeRequest,
  changeScenario,
  denyRuntimeRequest,
  fetchRuntimeSnapshot,
  pauseRuntimeRequest,
  resumeRuntimeRequest,
} from './runtime/api';
import type { RuntimeScenario } from './runtime/scenarioTypes';

const scenarioOptions = getScenarioOptions();

export default function App() {
  const [scenarioId, setScenarioId] = useState(scenarioOptions[0]?.id ?? 'reporting-access');
  const [runtime, setRuntime] = useState<RuntimeScenario | null>(null);
  const [selectedStageId, setSelectedStageId] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [inspectionOpen, setInspectionOpen] = useState(true);

  useEffect(() => {
    fetchRuntimeSnapshot().then((snapshot) => {
      setRuntime(snapshot);
      setSelectedStageId(snapshot.stages.find((stage) => stage.status === 'current')?.id ?? snapshot.stages[0].id);
      setSelectedEventId(snapshot.timeline[snapshot.timeline.length - 1]?.id ?? snapshot.timeline[0].id);
    });
  }, []);

  const selectedStage = useMemo(() => {
    if (!runtime) return null;
    return runtime.stages.find((stage) => stage.id === selectedStageId) ?? runtime.stages[0];
  }, [runtime, selectedStageId]);

  const selectedEvent = useMemo(() => {
    if (!runtime) return null;
    return runtime.timeline.find((event) => event.id === selectedEventId) ?? runtime.timeline[0];
  }, [runtime, selectedEventId]);

  const selectedInspection = runtime && selectedEvent
    ? runtime.inspections[selectedEvent.inspectionKey ?? 'request']
    : null;

  async function refreshFromAction(action: Promise<RuntimeScenario>) {
    const snapshot = await action;
    setRuntime(snapshot);
    setSelectedStageId(snapshot.stages.find((stage) => stage.status === 'current')?.id ?? snapshot.stages[0].id);
    setSelectedEventId(snapshot.timeline[snapshot.timeline.length - 1]?.id ?? snapshot.timeline[0].id);
  }

  async function handleScenarioChange(nextScenarioId: string) {
    setScenarioId(nextScenarioId);
    await refreshFromAction(changeScenario(nextScenarioId));
  }

  if (!runtime || !selectedStage || !selectedEvent || !selectedInspection) {
    return (
      <div className="min-h-screen bg-transparent px-4 py-8 text-slate-100 lg:px-8">
        <div className="mx-auto max-w-[1500px] rounded-3xl border border-line bg-panel/95 p-8 shadow-panel">
          <div className="text-lg font-semibold text-slate-50">Loading TrustPlane runtime…</div>
          <div className="mt-2 text-sm text-muted">Initializing the local runtime adapter and current scenario snapshot.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent px-4 py-8 text-slate-100 lg:px-8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
        <RequestHeader request={runtime.request} trustModel={runtime.trustModel} />
        <ScenarioSelector options={scenarioOptions} value={scenarioId} onChange={handleScenarioChange} />
        <ApprovalBar
          onApprove={() => refreshFromAction(approveRuntimeRequest())}
          onDeny={() => refreshFromAction(denyRuntimeRequest())}
          onPause={() => refreshFromAction(pauseRuntimeRequest())}
          onResume={() => refreshFromAction(resumeRuntimeRequest())}
        />
        <WorkflowRail stages={runtime.stages} selectedStageId={selectedStageId} onSelect={setSelectedStageId} />

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <DecisionPanel stage={selectedStage} />
          <div className="space-y-6">
            <HumanCheckpointsPanel checkpoints={runtime.humanCheckpoints} />
            <TimelinePanel timeline={runtime.timeline} selectedEventId={selectedEventId} onSelect={setSelectedEventId} />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <ExecutionTracePanel steps={runtime.executionSteps} />
          <PlaybookCard playbook={runtime.playbook} />
        </div>

        <InspectionDrawer
          open={inspectionOpen}
          record={selectedInspection}
          onToggle={() => setInspectionOpen((value) => !value)}
        />
      </div>
    </div>
  );
}
