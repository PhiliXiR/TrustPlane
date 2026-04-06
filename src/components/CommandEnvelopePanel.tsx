import type { CommandEnvelope, ExecutionSubstrate } from '../types';
import type { RequestSnapshot } from '../runtime/requestTypes';
import { SectionHeader, StatusBadge, SurfaceCard } from './ui';

type Props = {
  envelope: CommandEnvelope;
  substrate: ExecutionSubstrate;
  snapshot?: RequestSnapshot | null;
};

export function CommandEnvelopePanel({ envelope, substrate, snapshot }: Props) {
  const approvalState = snapshot?.pendingAction.status ?? envelope.approvalState;
  const actionSummary = snapshot?.pendingAction.summary;
  const riskSummary = snapshot?.pendingAction.riskSummary;
  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-6 shadow-panel">
      <SectionHeader
        title="Command envelope"
        description="The governed command package the current operator agent may execute through the selected substrate."
        meta={<StatusBadge tone="accent">{approvalState}</StatusBadge>}
      />

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Meta label="Prepared by" value={envelope.preparedByAgentId} />
        <Meta label="Executor" value={envelope.intendedExecutor.name} />
        <Meta label="Substrate" value={substrate.displayName} />
        <Meta label="Risk class" value={envelope.riskClass} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <SurfaceCard>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Prepared command</div>
          <pre className="tp-pretty-wrap mt-3 overflow-x-auto rounded-2xl border border-line bg-black/20 p-4 font-mono text-xs leading-6 text-slate-200">{envelope.command}</pre>
          <div className="mt-3 text-sm leading-6 text-slate-300">
            <span className="font-semibold text-slate-100">Expected verification:</span> {envelope.expectedVerification}
          </div>
          {actionSummary ? (
            <div className="mt-3 text-sm leading-6 text-slate-300">
              <span className="font-semibold text-slate-100">Projected pending action:</span> {actionSummary}
            </div>
          ) : null}
        </SurfaceCard>

        <div className="space-y-4">
          <SurfaceCard>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Arguments</div>
            <div className="mt-3 flex flex-wrap gap-2 min-w-0">
              {envelope.arguments.map((arg) => (
                <StatusBadge key={arg} tone="accent">{arg}</StatusBadge>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Execution notes</div>
            <div className="mt-3 space-y-3 text-sm leading-6 text-slate-300">
              <div className="tp-wrap-anywhere"><span className="font-semibold text-slate-100">Working directory:</span> {envelope.workingDirectory ?? '—'}</div>
              <div className="tp-wrap-anywhere"><span className="font-semibold text-slate-100">Rollback command:</span> {envelope.rollbackCommand ?? '—'}</div>
              {riskSummary ? <div className="tp-wrap-anywhere"><span className="font-semibold text-slate-100">Projected risk summary:</span> {riskSummary}</div> : null}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-ink/60 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-100 tp-wrap-anywhere">{value}</div>
    </div>
  );
}
