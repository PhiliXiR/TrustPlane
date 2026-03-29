import type { HumanCheckpoint } from '../types';

type Props = { checkpoints: HumanCheckpoint[] };

export function HumanCheckpointsPanel({ checkpoints }: Props) {
  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-6 shadow-panel">
      <h2 className="text-lg font-semibold text-slate-50">Human Checkpoints</h2>
      <p className="mt-1 text-sm text-muted">Where authority shifts, pauses, or requires explicit human review.</p>
      <div className="mt-5 space-y-3">
        {checkpoints.map((checkpoint) => (
          <div key={checkpoint.id} className={`rounded-2xl border px-4 py-4 ${classes(checkpoint.state)}`}>
            <div className="text-sm font-semibold text-slate-100">{checkpoint.label}</div>
            <div className="mt-1 text-sm leading-6 text-slate-300">{checkpoint.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function classes(state: HumanCheckpoint['state']) {
  switch (state) {
    case 'completed':
      return 'border-success/30 bg-success/10';
    case 'current':
      return 'border-violet/35 bg-violet/10';
    default:
      return 'border-line bg-ink/55';
  }
}
