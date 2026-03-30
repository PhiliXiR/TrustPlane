import type { CommandEnvelope, ExecutionSubstrate } from '../types';

type Props = {
  envelope: CommandEnvelope;
  substrate: ExecutionSubstrate;
};

export function CommandEnvelopePanel({ envelope, substrate }: Props) {
  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-6 shadow-panel">
      <h2 className="text-lg font-semibold text-slate-50">Command Envelope</h2>
      <p className="mt-1 text-sm text-muted">The governed command package the current operator agent may execute through the selected substrate.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Meta label="Prepared by" value={envelope.preparedByAgentId} />
        <Meta label="Executor" value={envelope.intendedExecutor.name} />
        <Meta label="Substrate" value={substrate.displayName} />
        <Meta label="Approval state" value={envelope.approvalState} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-line bg-ink/70 p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Prepared command</div>
          <pre className="mt-3 overflow-x-auto rounded-2xl border border-line bg-black/20 p-4 font-mono text-xs leading-6 text-slate-200">{envelope.command}</pre>
          <div className="mt-3 text-sm leading-6 text-slate-300">
            <span className="font-semibold text-slate-100">Expected verification:</span> {envelope.expectedVerification}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-ink/70 p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Arguments</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {envelope.arguments.map((arg) => (
                <Chip key={arg}>{arg}</Chip>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-ink/70 p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Execution notes</div>
            <div className="mt-3 space-y-3 text-sm leading-6 text-slate-300">
              <div><span className="font-semibold text-slate-100">Risk class:</span> {envelope.riskClass}</div>
              <div><span className="font-semibold text-slate-100">Working directory:</span> {envelope.workingDirectory ?? '—'}</div>
              <div><span className="font-semibold text-slate-100">Rollback command:</span> {envelope.rollbackCommand ?? '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-ink/60 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-100">{value}</div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">{children}</span>;
}
