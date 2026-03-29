import { useMemo, useState } from 'react';
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
import { loadRuntimeSnapshot } from './runtime/adapter';
import { getScenarioOptions } from './runtime';

const scenarioOptions = getScenarioOptions();

export default function App() {
  const [scenarioId, setScenarioId] = useState(scenarioOptions[0]?.id ?? 'reporting-access');
  const runtime = useMemo(() => loadRuntimeSnapshot(scenarioId), [scenarioId]);

  const [selectedStageId, setSelectedStageId] = useState(runtime.stages.find((stage) => stage.status === 'current')?.id ?? runtime.stages[0].id);
  const [selectedEventId, setSelectedEventId] = useState(runtime.timeline[runtime.timeline.length - 1]?.id ?? runtime.timeline[0].id);
  const [inspectionOpen, setInspectionOpen] = useState(true);

  const selectedStage = useMemo(
    () => runtime.stages.find((stage) => stage.id === selectedStageId) ?? runtime.stages[0],
    [runtime, selectedStageId]
  );

  const selectedEvent = useMemo(
    () => runtime.timeline.find((event) => event.id === selectedEventId) ?? runtime.timeline[0],
    [runtime, selectedEventId]
  );

  const selectedInspection = runtime.inspections[selectedEvent.inspectionKey ?? 'request'];

  function handleScenarioChange(nextScenarioId: string) {
    const nextRuntime = loadRuntimeSnapshot(nextScenarioId);
    setScenarioId(nextScenarioId);
    setSelectedStageId(nextRuntime.stages.find((stage) => stage.status === 'current')?.id ?? nextRuntime.stages[0].id);
    setSelectedEventId(nextRuntime.timeline[nextRuntime.timeline.length - 1]?.id ?? nextRuntime.timeline[0].id);
  }

  return (
    <div className="min-h-screen bg-transparent px-4 py-8 text-slate-100 lg:px-8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
        <RequestHeader request={runtime.request} trustModel={runtime.trustModel} />
        <ScenarioSelector options={scenarioOptions} value={scenarioId} onChange={handleScenarioChange} />
        <ApprovalBar />
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
