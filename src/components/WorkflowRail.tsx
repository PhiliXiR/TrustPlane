import type { Stage } from '../types';

type Props = {
  stages: Stage[];
  selectedStageId: string;
  onSelect: (id: string) => void;
};

export function WorkflowRail({ stages, selectedStageId, onSelect }: Props) {
  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-6 shadow-panel">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">Workflow Rail</h2>
          <p className="mt-1 text-sm text-muted">One governed request moving through a controlled runtime.</p>
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-9">
        {stages.map((stage) => {
          const isSelected = stage.id === selectedStageId;
          return (
            <button
              key={stage.id}
              onClick={() => onSelect(stage.id)}
              className={`rounded-2xl border p-4 text-left ${stageClasses(stage.status, isSelected)}`}
            >
              <div className="text-xs uppercase tracking-[0.18em] text-muted">{statusLabel(stage.status)}</div>
              <div className="mt-2 text-sm font-semibold text-slate-50">{stage.label}</div>
              {stage.reason ? <div className="mt-2 text-xs text-warn">{stage.reason}</div> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function stageClasses(status: Stage['status'], isSelected: boolean) {
  const base = 'transition-all duration-150';
  const selected = isSelected ? 'ring-1 ring-accent/50 border-accent/40' : 'border-line';
  const byStatus: Record<Stage['status'], string> = {
    completed: 'bg-slate-900/70 text-muted',
    current: 'bg-accent/10 shadow-[0_0_0_1px_rgba(143,208,255,0.08),0_0_24px_rgba(143,208,255,0.08)]',
    future: 'bg-ink/50 opacity-70',
    blocked: 'bg-danger/10 border-danger/35',
  };
  return `${base} ${selected} ${byStatus[status]}`;
}

function statusLabel(status: Stage['status']) {
  switch (status) {
    case 'completed': return 'completed';
    case 'current': return 'active';
    case 'blocked': return 'blocked';
    default: return 'up next';
  }
}
