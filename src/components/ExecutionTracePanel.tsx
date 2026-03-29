import type { ExecutionStep } from '../types';

type Props = { steps: ExecutionStep[] };

export function ExecutionTracePanel({ steps }: Props) {
  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-6 shadow-panel">
      <h2 className="text-lg font-semibold text-slate-50">Execution Trace</h2>
      <p className="mt-1 text-sm text-muted">Separate the governed execution path from workflow movement and policy authority.</p>
      <div className="mt-5 space-y-3">
        {steps.map((step) => (
          <div key={step.id} className={`rounded-2xl border px-4 py-4 ${classes(step.state)}`}>
            <div className="text-sm font-semibold text-slate-100">{step.label}</div>
            <div className="mt-1 text-sm leading-6 text-slate-300">{step.detail}</div>
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
      return 'border-accent/35 bg-accent/10';
    default:
      return 'border-line bg-ink/55';
  }
}
