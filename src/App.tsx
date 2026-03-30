import { useEffect, useMemo, useState } from 'react';
import { ApprovalBar } from './components/ApprovalBar';
import { CommandEnvelopePanel } from './components/CommandEnvelopePanel';
import { DecisionPanel } from './components/DecisionPanel';
import { ExecutionTracePanel } from './components/ExecutionTracePanel';
import { HumanCheckpointsPanel } from './components/HumanCheckpointsPanel';
import { InspectionDrawer } from './components/InspectionDrawer';
import { LiveExecutionPanel } from './components/LiveExecutionPanel';
import { OperatorControlPanel } from './components/OperatorControlPanel';
import { PlaybookCard } from './components/PlaybookCard';
import { RequestHeader } from './components/RequestHeader';
import { ScenarioSelector } from './components/ScenarioSelector';
import { TimelinePanel } from './components/TimelinePanel';
import { WorkflowRail } from './components/WorkflowRail';
import {
  approveRuntimeRequest,
  changeScenario,
  denyRuntimeRequest,
  fetchRuntimeSnapshot,
  fetchScenarioOptions,
  getEventsUrl,
  pauseRuntimeRequest,
  releaseExecutionAuthority,
  resumeRuntimeRequest,
} from './api';
import type { RuntimeScenario } from './runtime/scenarioTypes';

type ScenarioOption = { id: string; label: string };
type ExecutionLogEntry = { id: string; stream: 'stdout' | 'stderr'; message: string };

export default function App() {
  const [scenarioId, setScenarioId] = useState('');
  const [scenarioOptions, setScenarioOptions] = useState<ScenarioOption[]>([]);
  const [runtime, setRuntime] = useState<RuntimeScenario | null>(null);
  const [selectedStageId, setSelectedStageId] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [inspectionOpen, setInspectionOpen] = useState(true);
  const [liveExecution, setLiveExecution] = useState<ExecutionLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchScenarioOptions(), fetchRuntimeSnapshot()])
      .then(([options, snapshot]) => {
        setScenarioOptions(options);
        setScenarioId(snapshot.id);
        setRuntime(snapshot);
        setSelectedStageId(snapshot.stages.find((stage) => stage.status === 'current')?.id ?? snapshot.stages[0].id);
        setSelectedEventId(snapshot.timeline[snapshot.timeline.length - 1]?.id ?? snapshot.timeline[0].id);
      })
      .catch((err) => {
        setError(String(err));
      });
  }, []);

  useEffect(() => {
    const source = new EventSource(getEventsUrl());

    source.addEventListener('runtime.snapshot', (event) => {
      const snapshot = JSON.parse((event as MessageEvent).data) as RuntimeScenario;
      setRuntime(snapshot);
      setScenarioId(snapshot.id);
      setSelectedStageId((current) => current || snapshot.stages.find((stage) => stage.status === 'current')?.id || snapshot.stages[0].id);
      setSelectedEventId(snapshot.timeline[snapshot.timeline.length - 1]?.id ?? snapshot.timeline[0].id);
    });

    source.addEventListener('execution.stream', (event) => {
      const payload = JSON.parse((event as MessageEvent).data) as { eventType: string; stream: 'stdout' | 'stderr'; message: string };
      setLiveExecution((current) => [...current, { id: `${payload.eventType}-${current.length + 1}`, stream: payload.stream, message: payload.message }]);
    });

    source.onerror = () => {
      source.close();
    };

    return () => source.close();
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
    setScenarioId(snapshot.id);
    setSelectedStageId(snapshot.stages.find((stage) => stage.status === 'current')?.id ?? snapshot.stages[0].id);
    setSelectedEventId(snapshot.timeline[snapshot.timeline.length - 1]?.id ?? snapshot.timeline[0].id);
  }

  async function handleScenarioChange(nextScenarioId: string) {
    try {
      setLiveExecution([]);
      await refreshFromAction(changeScenario(nextScenarioId));
    } catch (err) {
      setError(String(err));
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent px-4 py-8 text-slate-100 lg:px-8">
        <div className="mx-auto max-w-[1500px] rounded-3xl border border-danger/30 bg-danger/10 p-8 shadow-panel">
          <div className="text-lg font-semibold text-slate-50">TrustPlane backend unavailable</div>
          <div className="mt-2 text-sm text-slate-200">Start the FastAPI backend first and confirm the configured API base is reachable.</div>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-danger/25 bg-ink/60 p-4 text-xs text-slate-200">{error}</pre>
        </div>
      </div>
    );
  }

  if (!runtime || !selectedStage || !selectedEvent || !selectedInspection) {
    return (
      <div className="min-h-screen bg-transparent px-4 py-8 text-slate-100 lg:px-8">
        <div className="mx-auto max-w-[1500px] rounded-3xl border border-line bg-panel/95 p-8 shadow-panel">
          <div className="text-lg font-semibold text-slate-50">Loading TrustPlane runtime…</div>
          <div className="mt-2 text-sm text-muted">Fetching current state from the FastAPI runtime adapter.</div>
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
          onApprove={() => refreshFromAction(approveRuntimeRequest()).catch((err) => setError(String(err)))}
          onReleaseExecution={() => refreshFromAction(releaseExecutionAuthority()).catch((err) => setError(String(err)))}
          onDeny={() => refreshFromAction(denyRuntimeRequest()).catch((err) => setError(String(err)))}
          onPause={() => refreshFromAction(pauseRuntimeRequest()).catch((err) => setError(String(err)))}
          onResume={() => refreshFromAction(resumeRuntimeRequest()).catch((err) => setError(String(err)))}
        />
        <OperatorControlPanel
          operators={runtime.operators}
          ownership={runtime.ownership}
          delegation={runtime.delegation}
          authorityBoundary={runtime.authorityBoundary}
          executionSubstrate={runtime.executionSubstrate}
        />
        <WorkflowRail stages={runtime.stages} selectedStageId={selectedStageId} onSelect={setSelectedStageId} />

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <DecisionPanel stage={selectedStage} />
          <div className="space-y-6">
            <HumanCheckpointsPanel checkpoints={runtime.humanCheckpoints} />
            <TimelinePanel timeline={runtime.timeline} selectedEventId={selectedEventId} onSelect={setSelectedEventId} />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <CommandEnvelopePanel envelope={runtime.commandEnvelope} substrate={runtime.executionSubstrate} />
          <ExecutionTracePanel steps={runtime.executionSteps} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <PlaybookCard playbook={runtime.playbook} />
          <LiveExecutionPanel entries={liveExecution} />
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
