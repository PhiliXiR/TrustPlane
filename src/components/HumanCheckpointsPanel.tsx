import type { HumanCheckpoint } from '../types';
import type { RequestSnapshot } from '../runtime/requestTypes';
import { deriveHumanCheckpoints } from '../runtime/requestViewAdapters';

type Props = { checkpoints: HumanCheckpoint[]; snapshot?: RequestSnapshot | null };

export function HumanCheckpointsPanel({ checkpoints, snapshot }: Props) {
  const resolvedCheckpoints = deriveHumanCheckpoints(snapshot, checkpoints);
  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-6 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">Human checkpoints</h2>
          <p className="mt-1 text-sm text-muted">Where authority shifts, pauses, or requires explicit human review.</p>
        </div>
        <span className="rounded-full border border-line bg-ink/60 px-3 py-1 text-xs text-slate-300">{resolvedCheckpoints.length} checkpoints</span>
      </div>

      <div className="mt-5 space-y-3">
        {resolvedCheckpoints.map((checkpoint, index) => (
          <div key={checkpoint.id} className="flex gap-3">
            <div className="flex w-8 shrink-0 flex-col items-center pt-2">
              <div className={`h-2.5 w-2.5 rounded-full ${dotClasses(checkpoint.state)}`} />
              {index < resolvedCheckpoints.length - 1 ? <div className="mt-2 h-full w-px bg-line/80" /> : null}
            </div>
            <div className={`flex-1 rounded-2xl border px-4 py-4 ${classes(checkpoint.state)}`}>
              <div className="text-sm font-semibold text-slate-100">{checkpoint.label}</div>
              <div className="mt-1 text-sm leading-6 text-slate-300">{checkpoint.detail}</div>
            </div>
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
      return 'selected-surface border-violet/35 bg-violet/10';
    default:
      return 'border-line bg-ink/55';
  }
}

function dotClasses(state: HumanCheckpoint['state']) {
  switch (state) {
    case 'completed':
      return 'bg-success shadow-[0_0_0_6px_rgba(16,185,129,0.10)]';
    case 'current':
      return 'bg-violet shadow-[0_0_0_6px_rgba(139,92,246,0.12)]';
    default:
      return 'bg-slate-500';
  }
}
