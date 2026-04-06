import type { AgentAuthorityBoundary, DelegationState, ExecutionSubstrate, OperatorAgent, OwnershipState } from '../types';
import type { RequestSnapshot } from '../runtime/requestTypes';
import { SectionHeader, StatusBadge, SurfaceCard } from './ui';

type Props = {
  operators: OperatorAgent[];
  ownership: OwnershipState;
  delegation: DelegationState;
  authorityBoundary: AgentAuthorityBoundary;
  executionSubstrate: ExecutionSubstrate;
  snapshot?: RequestSnapshot | null;
};

export function OperatorControlPanel({
  operators,
  ownership,
  delegation,
  authorityBoundary,
  executionSubstrate,
  snapshot,
}: Props) {
  const currentOwner = snapshot?.request.currentOwner ?? ownership.currentOwner.name;
  const delegationMode = snapshot?.trustState.delegationMode ?? delegation.delegationMode.split('_').join(' ');
  const executionMode = snapshot?.trustState.executionMode ?? executionSubstrate.mode.split('_').join(' ');
  const blockedReason = snapshot?.workflowState.blockedReason ?? delegation.reason;
  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-6 shadow-panel">
      <SectionHeader
        title="Operator flow and authority"
        description="The shortest explanation of who owns the request, how it got here, and what the current operator can actually do."
      />

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <SurfaceCard tone="accent">
          <div className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Current owner</div>
          <div className="mt-4 text-base font-semibold text-slate-50 tp-wrap-anywhere">{currentOwner}</div>
          <div className="mt-1 text-sm text-slate-300 tp-wrap-anywhere">Lane: {ownership.currentOwner.lane}</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Meta label="Assigned at" value={ownership.assignedAt} />
            <Meta label="Previous owner" value={ownership.previousOwner?.name ?? '—'} />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300 tp-wrap-anywhere">{ownership.ownershipReason}</p>
        </SurfaceCard>

        <SurfaceCard tone="violet">
          <div className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Routing decision</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Meta label="Delegation mode" value={delegationMode} />
            <Meta label="Confidence" value={delegation.confidence} />
            <Meta label="Selected lane" value={delegation.selectedLane} />
            <Meta label="Router" value={delegation.routingComponent} />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300 tp-wrap-anywhere">{blockedReason}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {delegation.candidateLanes.map((lane) => <StatusBadge key={lane} tone="accent">{lane}</StatusBadge>)}
            {delegation.rejectedLanes.map((lane) => <StatusBadge key={lane} tone="warn">rejected: {lane}</StatusBadge>)}
            {delegation.humanConfirmationRequired ? <StatusBadge tone="warn">human confirmation required</StatusBadge> : null}
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <div className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Execution authority</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Meta label="Authority profile" value={authorityBoundary.authorityMode.split('_').join(' ')} />
            <Meta label="Execution substrate" value={executionSubstrate.displayName} />
            <Meta label="Substrate mode" value={executionMode} />
            <Meta label="Streaming" value={executionSubstrate.supportsStreaming ? 'supported' : 'not supported'} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Capability enabled={authorityBoundary.mayClarify} label="clarify" />
            <Capability enabled={authorityBoundary.mayPrepare} label="prepare" />
            <Capability enabled={authorityBoundary.mayExecute} label="execute" />
            <Capability enabled={authorityBoundary.mayApprove} label="approve" />
            <Capability enabled={authorityBoundary.mayDelegate} label="delegate" />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300 tp-wrap-anywhere">{snapshot?.trustState.why ?? authorityBoundary.separationOfDutiesRule}</p>
        </SurfaceCard>
      </div>

      <SurfaceCard className="mt-6">
        <SectionHeader
          title="Active agents"
          meta={<StatusBadge>{operators.length} total</StatusBadge>}
        />

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {operators.map((operator) => (
            <div key={operator.agentId} className="min-w-0 rounded-2xl border border-line bg-ink/60 px-4 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-semibold text-slate-100 tp-wrap-anywhere">{operator.name}</div>
                <StatusBadge tone="accent">{operator.kind}</StatusBadge>
                <StatusBadge>{operator.lane}</StatusBadge>
                <StatusBadge>{operator.runtime}</StatusBadge>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Meta label="Status" value={operator.status} />
                <Meta label="Authority" value={operator.authorityProfile ?? '—'} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {operator.allowedSubstrates.map((substrate) => <StatusBadge key={substrate}>{substrate}</StatusBadge>)}
              </div>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-panel/35 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-100 tp-wrap-anywhere">{value}</div>
    </div>
  );
}

function Capability({ enabled, label }: { enabled: boolean; label: string }) {
  return <StatusBadge tone={enabled ? 'success' : 'neutral'}>{enabled ? 'can' : 'cannot'} {label}</StatusBadge>;
}
