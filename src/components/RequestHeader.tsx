import type { RequestModel } from '../types';

type Props = { request: RequestModel };

const pillStyles: Record<string, string> = {
  medium: 'border-warn/30 text-warn bg-warn/10',
  'human-approved execution': 'border-accent/30 text-accent bg-accent/10',
};

export function RequestHeader({ request }: Props) {
  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-6 shadow-panel">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent">TrustPlane</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50">{request.title}</h1>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <StatusPill label="Current state" value={request.state} />
          <StatusPill label="Current owner" value={request.owner} />
          <StatusPill label="Risk level" value={request.risk} tone={pillStyles[request.risk]} />
          <StatusPill label="Autonomy mode" value={request.autonomyMode} tone={pillStyles[request.autonomyMode]} />
        </div>
      </div>
    </section>
  );
}

function StatusPill({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className={`min-w-[170px] rounded-2xl border border-line bg-ink/70 px-4 py-3 ${tone ?? ''}`}>
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-100">{value}</div>
    </div>
  );
}
