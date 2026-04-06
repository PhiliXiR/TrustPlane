import type { Stage } from '../types';
import type { IntakeExampleFixture } from '../runtime/exampleTypes';
import type { RequestSnapshot } from '../runtime/requestTypes';
import { deriveWorkflowRailStages, deriveWorkflowRailStagesFromExample } from '../runtime/requestViewAdapters';

type Props = {
  stages: Stage[];
  selectedStageId: string;
  onSelect: (id: string) => void;
  snapshot?: RequestSnapshot | null;
  example?: IntakeExampleFixture | null;
};

export function WorkflowRail({ stages, selectedStageId, onSelect, snapshot, example }: Props) {
  const resolvedStages = example
    ? deriveWorkflowRailStagesFromExample(example, stages)
    : deriveWorkflowRailStages(snapshot, stages);
  const currentStage = resolvedStages.find((stage) => stage.status === 'current');

  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-6 shadow-panel">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">Workflow rail</h2>
          <p className="mt-1 text-sm text-muted">One governed request moving through a controlled runtime.</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <LegendChip label="Completed" tone="completed" />
          <LegendChip label="Active" tone="current" />
          <LegendChip label="Up next" tone="future" />
          <LegendChip label="Blocked" tone="blocked" />
        </div>
      </div>

      {currentStage ? (
        <div className="mb-4 rounded-2xl border border-accent/20 bg-accent/6 px-4 py-3 text-sm text-slate-200 animate-rise-in">
          <span className="font-semibold text-slate-50">Now active:</span> {currentStage.label}
        </div>
      ) : null}

      <div className="tp-scroll-x pb-2">
        <div className="flex min-w-[1040px] items-stretch gap-3 lg:min-w-0 xl:min-w-[1040px]">
          {resolvedStages.map((stage, index) => {
            const isSelected = stage.id === selectedStageId;
            const isLast = index === stages.length - 1;

            return (
              <div key={stage.id} className="flex min-w-[220px] flex-1 items-center gap-3 lg:min-w-0 xl:min-w-[220px]">
                <button
                  onClick={() => onSelect(stage.id)}
                  className={`relative min-h-[132px] flex-1 rounded-2xl border p-4 text-left ${stageClasses(stage.status, isSelected)}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted">{statusLabel(stage.status)}</div>
                    <div className={`h-2.5 w-2.5 rounded-full ${stageDotClasses(stage.status)}`} />
                  </div>
                  <div className="mt-3 text-sm font-semibold tracking-[-0.01em] text-slate-50 tp-wrap-anywhere">{stage.label}</div>
                  <div className="mt-2 text-xs leading-6 text-slate-300 tp-wrap-anywhere">{stage.explanation}</div>
                  {stage.reason ? <div className="mt-2 text-xs text-warn tp-wrap-anywhere">{stage.reason}</div> : null}
                </button>

                {!isLast ? (
                  <div className="workflow-connector hidden w-10 shrink-0 lg:block" aria-hidden="true">
                    <div className="workflow-connector__line" />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LegendChip({ label, tone }: { label: string; tone: Stage['status'] }) {
  return <span className={`rounded-full border px-3 py-1.5 ${stageLegendClasses(tone)}`}>{label}</span>;
}

function stageClasses(status: Stage['status'], isSelected: boolean) {
  const base = 'transition-all duration-200 hover:-translate-y-[1px]';
  const selected = isSelected ? 'selected-surface ring-1 ring-accent/50 border-accent/40 shadow-[0_0_0_1px_rgba(143,208,255,0.08),0_0_24px_rgba(143,208,255,0.08)]' : 'border-line';
  const byStatus: Record<Stage['status'], string> = {
    completed: 'bg-slate-900/70 text-muted',
    current: 'bg-accent/10',
    future: 'bg-ink/50 opacity-80',
    blocked: 'bg-danger/10 border-danger/35',
  };
  return `${base} ${selected} ${byStatus[status]}`;
}

function stageLegendClasses(status: Stage['status']) {
  const byStatus: Record<Stage['status'], string> = {
    completed: 'border-line bg-slate-900/70 text-slate-300',
    current: 'border-accent/30 bg-accent/10 text-accent',
    future: 'border-line bg-ink/55 text-slate-300',
    blocked: 'border-danger/35 bg-danger/10 text-danger',
  };

  return byStatus[status];
}

function stageDotClasses(status: Stage['status']) {
  const byStatus: Record<Stage['status'], string> = {
    completed: 'bg-success shadow-[0_0_0_6px_rgba(16,185,129,0.10)]',
    current: 'bg-accent shadow-[0_0_0_6px_rgba(143,208,255,0.10)]',
    future: 'bg-slate-500',
    blocked: 'bg-danger shadow-[0_0_0_6px_rgba(239,68,68,0.10)]',
  };

  return byStatus[status];
}

function statusLabel(status: Stage['status']) {
  switch (status) {
    case 'completed': return 'completed';
    case 'current': return 'active';
    case 'blocked': return 'blocked';
    default: return 'up next';
  }
}
