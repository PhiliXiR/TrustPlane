import type { AgentAuthorityBoundary, DelegationState, ExecutionSubstrate, OperatorAgent, OwnershipState } from '../types';

type Props = {
  operators: OperatorAgent[];
  ownership: OwnershipState;
  delegation: DelegationState;
  authorityBoundary: AgentAuthorityBoundary;
  executionSubstrate: ExecutionSubstrate;
};

export function OperatorControlPanel({
  operators,
  ownership,
  delegation,
  authorityBoundary,
  executionSubstrate,
}: Props) {
  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-6 shadow-panel">
      <h2 className="text-lg font-semibold text-slate-50">NemoClaw Operator Topology</h2>
      <p className="mt-1 text-sm text-muted">Who owns the request, how it was routed, and what the current operator is allowed to do inside NemoClaw.</p>

      <div className="mt-5 grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="space-y-4">
          <Card title="Current ownership">
            <div className="grid gap-3 md:grid-cols-2">
              <Meta label="Current owner" value={ownership.currentOwner.name} />
              <Meta label="Current lane" value={ownership.currentOwner.lane} />
              <Meta label="Assigned at" value={ownership.assignedAt} />
              <Meta label="Previous owner" value={ownership.previousOwner?.name ?? '—'} />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{ownership.ownershipReason}</p>
          </Card>

          <Card title="Delegation and routing">
            <div className="grid gap-3 md:grid-cols-2">
              <Meta label="Delegation mode" value={delegation.delegationMode} />
              <Meta label="Routing component" value={delegation.routingComponent} />
              <Meta label="Selected lane" value={delegation.selectedLane} />
              <Meta label="Confidence" value={delegation.confidence} />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{delegation.reason}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {delegation.candidateLanes.map((lane) => <Chip key={lane}>{lane}</Chip>)}
              {delegation.rejectedLanes.map((lane) => <Chip key={lane} tone="warn">rejected: {lane}</Chip>)}
              {delegation.humanConfirmationRequired ? <Chip tone="warn">human confirmation required</Chip> : null}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Operator authority boundary">
            <div className="grid gap-3 md:grid-cols-2">
              <Meta label="Authority profile" value={authorityBoundary.authorityMode} />
              <Meta label="Execution substrate" value={executionSubstrate.displayName} />
              <Meta label="Substrate mode" value={executionSubstrate.mode} />
              <Meta label="Streaming" value={executionSubstrate.supportsStreaming ? 'supported' : 'not supported'} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip tone={authorityBoundary.mayClarify ? 'accent' : 'warn'}>{authorityBoundary.mayClarify ? 'may clarify' : 'no clarify'}</Chip>
              <Chip tone={authorityBoundary.mayPrepare ? 'accent' : 'warn'}>{authorityBoundary.mayPrepare ? 'may prepare' : 'no prepare'}</Chip>
              <Chip tone={authorityBoundary.mayExecute ? 'accent' : 'warn'}>{authorityBoundary.mayExecute ? 'may execute' : 'no execute'}</Chip>
              <Chip tone={authorityBoundary.mayApprove ? 'accent' : 'warn'}>{authorityBoundary.mayApprove ? 'may approve' : 'no approve'}</Chip>
              <Chip tone={authorityBoundary.mayDelegate ? 'accent' : 'warn'}>{authorityBoundary.mayDelegate ? 'may delegate' : 'no delegate'}</Chip>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{authorityBoundary.separationOfDutiesRule}</p>
          </Card>

          <Card title="Active NemoClaw agents">
            <div className="space-y-3">
              {operators.map((operator) => (
                <div key={operator.agentId} className="rounded-2xl border border-line bg-ink/60 px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold text-slate-100">{operator.name}</div>
                    <Chip>{operator.kind}</Chip>
                    <Chip>{operator.lane}</Chip>
                    <Chip>{operator.runtime}</Chip>
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-300">
                    {operator.authorityProfile ? <span><span className="font-semibold text-slate-100">Authority:</span> {operator.authorityProfile}. </span> : null}
                    <span><span className="font-semibold text-slate-100">Status:</span> {operator.status}.</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {operator.allowedSubstrates.map((substrate) => <Chip key={substrate}>{substrate}</Chip>)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-line bg-ink/45 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-ink/70 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-100">{value}</div>
    </div>
  );
}

function Chip({ children, tone = 'accent' }: { children: React.ReactNode; tone?: 'accent' | 'warn' }) {
  const toneClass = tone === 'warn'
    ? 'border-warn/30 bg-warn/10 text-warn'
    : 'border-accent/25 bg-accent/10 text-accent';

  return <span className={`rounded-full border px-3 py-1 text-xs font-medium ${toneClass}`}>{children}</span>;
}
