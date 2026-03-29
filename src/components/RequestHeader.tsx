import type { RequestModel } from '../types';

type Props = {
  request: RequestModel;
  trustModel: {
    level: string;
    currentBoundary: string;
    delegationRule: string;
    downgradeRule: string;
  };
};

const pillStyles: Record<string, string> = {
  medium: 'border-warn/30 text-warn bg-warn/10',
  'human-approved execution': 'border-accent/30 text-accent bg-accent/10',
};

export function RequestHeader({ request, trustModel }: Props) {
  return (
    <section className="rounded-[28px] border border-line bg-panel/95 p-6 shadow-panel lg:p-7">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent">TrustPlane</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50 lg:text-[2.15rem]">{request.title}</h1>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatusPill label="Current state" value={request.state} />
            <StatusPill label="Current owner" value={request.owner} />
            <StatusPill label="Risk level" value={request.risk} tone={pillStyles[request.risk]} />
            <StatusPill label="Autonomy mode" value={request.autonomyMode} tone={pillStyles[request.autonomyMode]} />
          </div>
        </div>

        <div className="rounded-3xl border border-violet/25 bg-violet/10 p-5">
          <div className="text-[11px] uppercase tracking-[0.2em] text-violet">Trust boundary</div>
          <div className="mt-2 text-lg font-semibold text-slate-50">{trustModel.level}</div>
          <p className="mt-3 text-sm leading-7 text-slate-200">{trustModel.currentBoundary}</p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <div>
              <span className="font-semibold text-slate-100">Delegation rule:</span> {trustModel.delegationRule}
            </div>
            <div>
              <span className="font-semibold text-slate-100">Downgrade path:</span> {trustModel.downgradeRule}
            </div>
          </div>
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
