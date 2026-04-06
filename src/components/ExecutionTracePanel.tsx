import type { ExecutionStep } from '../types';
import type { RequestSnapshot } from '../runtime/requestTypes';
import { deriveExecutionTrace } from '../runtime/requestViewAdapters';

type Props = { steps: ExecutionStep[]; snapshot?: RequestSnapshot | null };

export function ExecutionTracePanel({ steps, snapshot }: Props) {
  const resolvedSteps = deriveExecutionTrace(snapshot, steps);
  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-6 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">Execution trace</h2>
          <p className="mt-1 text-sm text-muted">Separate the governed execution path from workflow movement and policy authority.</p>
        </div>
        <span className="rounded-full border border-line bg-ink/60 px-3 py-1 text-xs text-slate-300">{resolvedSteps.length} steps</span>
      </div>

      <div className="mt-5 space-y-3">
        {resolvedSteps.map((step, index) => (
          <div key={step.id} className="flex gap-3">
            <div className="flex w-8 shrink-0 flex-col items-center pt-2">
              <div className={`h-2.5 w-2.5 rounded-full ${dotClasses(step.state)}`} />
              {index < resolvedSteps.length - 1 ? <div className="mt-2 h-full w-px bg-line/80" /> : null}
            </div>
            <div className={`flex-1 rounded-2xl border px-4 py-4 ${classes(step.state)}`}>
              <div className="text-sm font-semibold text-slate-100">{step.label}</div>
              <div className="mt-1 text-sm leading-6 text-slate-300">{step.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function classes(state: ExecutionStep['state']) {
  switch (state) {
    case 'completed':
      return 'border-success/30 bg-success/10';
    case 'current':
      return 'selected-surface border-accent/35 bg-accent/10';
    default:
      return 'border-line bg-ink/55';
  }
}

function dotClasses(state: ExecutionStep['state']) {
  switch (state) {
    case 'completed':
      return 'bg-success shadow-[0_0_0_6px_rgba(16,185,129,0.10)]';
    case 'current':
      return 'bg-accent shadow-[0_0_0_6px_rgba(143,208,255,0.10)]';
    default:
      return 'bg-slate-500';
  }
}
