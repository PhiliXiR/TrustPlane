import { useEffect, useMemo, useState } from 'react';
import { ApprovalBar } from './components/ApprovalBar';
import { CommandEnvelopePanel } from './components/CommandEnvelopePanel';
import { DecisionPanel } from './components/DecisionPanel';
import { ExecutionTracePanel } from './components/ExecutionTracePanel';
import { HumanCheckpointsPanel } from './components/HumanCheckpointsPanel';
import { InspectionDrawer } from './components/InspectionDrawer';
import { IntakeSpotlightCard } from './components/IntakeSpotlightCard';
import { LiveExecutionPanel } from './components/LiveExecutionPanel';
import { OperatorControlPanel } from './components/OperatorControlPanel';
import { PlaybookCard } from './components/PlaybookCard';
import { RequestHeader } from './components/RequestHeader';
import { ScenarioSelector } from './components/ScenarioSelector';
import { TimelinePanel } from './components/TimelinePanel';
import { WorkflowRail } from './components/WorkflowRail';
import { MetricCard } from './components/ui';
import {
  approveRequestById,
  approveRuntimeRequest,
  changeScenario,
  denyRequestById,
  denyRuntimeRequest,
  fetchRequestSnapshot,
  fetchRequestTimeline,
  fetchRuntimeSnapshot,
  fetchScenarioOptions,
  getEventsUrl,
  pauseRequestById,
  pauseRuntimeRequest,
  releaseExecutionAuthority,
  releaseExecutionById,
  resumeRequestById,
  resumeRuntimeRequest,
} from './api';
import type { RequestSnapshot, RequestTimelineResponse } from './runtime/requestTypes';
import type { RuntimeScenario } from './runtime/scenarioTypes';

type ScenarioOption = { id: string; label: string };
type ExecutionLogEntry = { id: string; stream: 'stdout' | 'stderr'; message: string };

export default function App() {
  const [scenarioId, setScenarioId] = useState('');
  const [scenarioOptions, setScenarioOptions] = useState<ScenarioOption[]>([]);
  const [runtime, setRuntime] = useState<RuntimeScenario | null>(null);
  const [selectedStageId, setSelectedStageId] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [requestSnapshot, setRequestSnapshot] = useState<RequestSnapshot | null>(null);
  const [requestTimeline, setRequestTimeline] = useState<RequestTimelineResponse | null>(null);
  const [inspectionOpen, setInspectionOpen] = useState(true);
  const [liveExecution, setLiveExecution] = useState<ExecutionLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchScenarioOptions(), fetchRuntimeSnapshot()])
      .then(async ([options, snapshot]) => {
        setScenarioOptions(options);
        setScenarioId(snapshot.id);
        setRuntime(snapshot);
        setSelectedStageId(snapshot.stages.find((stage) => stage.status === 'current')?.id ?? snapshot.stages[0].id);
        setSelectedEventId(snapshot.timeline[snapshot.timeline.length - 1]?.id ?? snapshot.timeline[0].id);
        const requestId = snapshot.request.intake?.requestId;
        if (requestId) {
          const [projected, projectedTimeline] = await Promise.all([
            fetchRequestSnapshot(requestId),
            fetchRequestTimeline(requestId),
          ]);
          setRequestSnapshot(projected);
          setRequestTimeline(projectedTimeline);
          setSelectedEventId(projectedTimeline.events[projectedTimeline.events.length - 1]?.eventId ?? snapshot.timeline[snapshot.timeline.length - 1]?.id ?? '');
        } else {
          setRequestSnapshot(null);
          setRequestTimeline(null);
        }
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
      hydrateProjectedState(snapshot);
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

  const selectedRequestEvent = useMemo(() => {
    return requestTimeline?.events.find((event) => event.eventId === selectedEventId) ?? requestTimeline?.events[0] ?? null;
  }, [requestTimeline, selectedEventId]);

  const selectedInspection = useMemo(() => {
    if (!runtime) return null;
    const inspectionKey = selectedRequestEvent?.details?.inspectionKey as string | undefined;
    return runtime.inspections[inspectionKey ?? selectedEvent?.inspectionKey ?? 'request'] ?? runtime.inspections.request;
  }, [runtime, selectedEvent, selectedRequestEvent]);

  async function hydrateProjectedState(snapshot: RuntimeScenario) {
    const requestId = snapshot.request.intake?.requestId;
    if (requestId) {
      try {
        const [snapshotData, timelineData] = await Promise.all([
          fetchRequestSnapshot(requestId),
          fetchRequestTimeline(requestId),
        ]);
        setRequestSnapshot(snapshotData);
        setRequestTimeline(timelineData);
        setSelectedEventId(timelineData.events[timelineData.events.length - 1]?.eventId ?? snapshot.timeline[snapshot.timeline.length - 1]?.id ?? '');
      } catch {
        setRequestSnapshot(null);
        setRequestTimeline(null);
      }
    } else {
      setRequestSnapshot(null);
      setRequestTimeline(null);
    }
  }

  async function refreshFromAction(action: Promise<RuntimeScenario>) {
    const snapshot = await action;
    setRuntime(snapshot);
    setScenarioId(snapshot.id);
    setSelectedStageId(snapshot.stages.find((stage) => stage.status === 'current')?.id ?? snapshot.stages[0].id);
    setSelectedEventId(snapshot.timeline[snapshot.timeline.length - 1]?.id ?? snapshot.timeline[0].id);
    await hydrateProjectedState(snapshot);
    setFlashMessage(snapshot.request.state);
  }

  async function handleScenarioChange(nextScenarioId: string) {
    try {
      setLiveExecution([]);
      await refreshFromAction(changeScenario(nextScenarioId));
    } catch (err) {
      setError(String(err));
    }
  }

  useEffect(() => {
    if (!flashMessage) return;
    const timeout = window.setTimeout(() => setFlashMessage(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [flashMessage]);

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

  const requestId = requestSnapshot?.request.requestId ?? runtime.request.intake?.requestId ?? null;

  return (
    <div className="min-h-screen bg-transparent px-4 py-8 text-slate-100 lg:px-8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5 lg:gap-6">
        {flashMessage ? (
          <div className="animate-rise-in rounded-2xl border border-success/25 bg-success/10 px-4 py-3 text-sm text-slate-100 shadow-panel">
            Runtime updated: <span className="font-semibold">{flashMessage}</span>
          </div>
        ) : null}

        <div className="grid gap-3 lg:grid-cols-4">
          <MetricCard label="Request state" value={runtime.request.state} tone="accent" emphasis="strong" />
          <MetricCard label="Current owner" value={runtime.ownership.currentOwner.name} />
          <MetricCard label="Selected stage" value={selectedStage.label} tone="violet" />
          <MetricCard label="Timeline events" value={String(requestTimeline?.events.length ?? runtime.timeline.length)} tone="success" />
        </div>

        <div className="grid gap-3 lg:grid-cols-4">
          <MetricCard label="Authority status" value={runtime.commandEnvelope.approvalState} tone="violet" emphasis="strong" />
          <MetricCard label="Execution substrate" value={runtime.executionSubstrate.displayName} />
          <MetricCard label="Autonomy mode" value={runtime.request.autonomyMode} tone="accent" />
          <MetricCard label="Execution logs" value={String(liveExecution.length)} tone="success" />
        </div>

        <RequestHeader request={runtime.request} trustModel={runtime.trustModel} snapshot={requestSnapshot} />
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <IntakeSpotlightCard request={runtime.request} snapshot={requestSnapshot} />
          <ScenarioSelector options={scenarioOptions} value={scenarioId} onChange={handleScenarioChange} />
        </div>
        <ApprovalBar
          requestState={runtime.request.state}
          autonomyMode={runtime.request.autonomyMode}
          currentStageLabel={selectedStage.label}
          snapshot={requestSnapshot}
          onApprove={() => refreshFromAction((requestId ? approveRequestById(requestId) : approveRuntimeRequest())).catch((err) => setError(String(err)))}
          onReleaseExecution={() => refreshFromAction((requestId ? releaseExecutionById(requestId) : releaseExecutionAuthority())).catch((err) => setError(String(err)))}
          onDeny={() => refreshFromAction((requestId ? denyRequestById(requestId) : denyRuntimeRequest())).catch((err) => setError(String(err)))}
          onPause={() => refreshFromAction((requestId ? pauseRequestById(requestId) : pauseRuntimeRequest())).catch((err) => setError(String(err)))}
          onResume={() => refreshFromAction((requestId ? resumeRequestById(requestId) : resumeRuntimeRequest())).catch((err) => setError(String(err)))}
        />
        <OperatorControlPanel
          operators={runtime.operators}
          ownership={runtime.ownership}
          delegation={runtime.delegation}
          authorityBoundary={runtime.authorityBoundary}
          executionSubstrate={runtime.executionSubstrate}
          snapshot={requestSnapshot}
        />
        <WorkflowRail stages={runtime.stages} selectedStageId={selectedStageId} onSelect={setSelectedStageId} snapshot={requestSnapshot} />

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <DecisionPanel stage={selectedStage} snapshot={requestSnapshot} />
            <InspectionDrawer
              open={inspectionOpen}
              record={selectedInspection}
              eventTitle={selectedEvent.title}
              eventCategory={selectedEvent.category}
              requestEvent={selectedRequestEvent}
              onToggle={() => setInspectionOpen((value) => !value)}
            />
          </div>
          <div className="space-y-6">
            <HumanCheckpointsPanel checkpoints={runtime.humanCheckpoints} snapshot={requestSnapshot} />
            <TimelinePanel timeline={runtime.timeline} selectedEventId={selectedEventId} onSelect={setSelectedEventId} requestTimeline={requestTimeline?.events} />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <CommandEnvelopePanel envelope={runtime.commandEnvelope} substrate={runtime.executionSubstrate} snapshot={requestSnapshot} />
          <ExecutionTracePanel steps={runtime.executionSteps} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <PlaybookCard playbook={runtime.playbook} />
          <LiveExecutionPanel entries={liveExecution} />
        </div>
      </div>
    </div>
  );
}
