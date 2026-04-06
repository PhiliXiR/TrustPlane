import { useEffect, useState } from 'react';
import type { IntakeExampleFixture } from '../runtime/exampleTypes';
import type { RequestSnapshot } from '../runtime/requestTypes';
import { StatusBadge } from './ui';

type Props = {
  requestState: string;
  autonomyMode: string;
  currentStageLabel?: string;
  onApprove: () => void;
  onDeny: () => void;
  onPause: () => void;
  onResume: () => void;
  onReleaseExecution: () => void;
  snapshot?: RequestSnapshot | null;
  example?: IntakeExampleFixture | null;
};

type PendingAction = 'approve' | 'release' | 'deny' | 'pause' | 'resume' | null;

export function ApprovalBar({
  requestState,
  autonomyMode,
  currentStageLabel,
  onApprove,
  onDeny,
  onPause,
  onResume,
  onReleaseExecution,
  snapshot,
  example,
}: Props) {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const effectiveRequestState = snapshot?.request.currentState ?? requestState;
  const effectiveAutonomyMode = snapshot?.request.delegationMode ?? autonomyMode;
  const pendingStatus = snapshot?.pendingAction.status ?? 'prepared';
  const requiresHumanReview = snapshot?.policyDecision.requiresHumanReview ?? true;
  const blocked = snapshot?.workflowState.blocked ?? false;

  const loweredState = effectiveRequestState.toLowerCase();
  const paused = loweredState.includes('paused') || pendingStatus === 'paused';
  const denied = loweredState.includes('denied') || pendingStatus === 'denied';
  const approved = loweredState.includes('authorized') || loweredState.includes('approved') || pendingStatus === 'executing' || pendingStatus === 'completed';
  const runtimeLive = (pendingStatus === 'executing' || pendingStatus === 'completed' || approved) && !paused && !denied;

  useEffect(() => {
    setPendingAction(null);
  }, [effectiveRequestState, effectiveAutonomyMode, currentStageLabel]);

  function confirmAction(action: Exclude<PendingAction, null>) {
    const actions = {
      approve: { label: 'Approved request', fn: onApprove },
      release: { label: 'Released execution authority', fn: onReleaseExecution },
      deny: { label: 'Denied request', fn: onDeny },
      pause: { label: 'Paused workflow', fn: onPause },
      resume: { label: 'Resumed workflow', fn: onResume },
    } as const;

    actions[action].fn();
    setLastAction(actions[action].label);
    setPendingAction(null);
  }

  const pendingCopy = pendingAction ? confirmationCopy[pendingAction] : null;

  return (
    <section className="sticky top-4 z-20 overflow-hidden rounded-3xl border border-line/90 bg-panel/95 p-4 shadow-panel backdrop-blur supports-[backdrop-filter]:bg-panel/85">
      <div className="control-glow" aria-hidden="true" />

      <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm font-semibold text-slate-100">Human intervention points</div>
              <StatusBadge tone={runtimeLive ? 'success' : paused ? 'warn' : denied ? 'warn' : 'violet'}>
                {runtimeLive ? 'runtime active' : paused ? 'paused' : denied ? 'denied' : 'review state'}
              </StatusBadge>
              {example ? <StatusBadge tone="warn">example</StatusBadge> : null}
            </div>
            <div className="mt-1 text-sm text-muted">Use this bar to release, hold, or revoke authority as the request moves through the governed runtime.</div>
            {snapshot ? (
              <div className="mt-2 text-xs text-slate-300">
                {blocked ? 'Blocked:' : 'Next:'} {snapshot.workflowState.blockedReason ?? snapshot.workflowState.nextStep}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusChip label="Request state" value={effectiveRequestState} />
            <StatusChip label="Autonomy" value={effectiveAutonomyMode} />
            {snapshot ? <StatusChip label="Pending status" value={pendingStatus} /> : null}
            {snapshot ? <StatusChip label="Review gate" value={requiresHumanReview ? 'required' : 'not required'} /> : null}
            {currentStageLabel ? <StatusChip label="Current stage" value={currentStageLabel} /> : null}
            {lastAction ? <StatusChip label="Last action" value={lastAction} tone="accent" /> : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 lg:gap-3">
          <ActionButton label="Approve" tone="success" onClick={() => setPendingAction('approve')} disabled={approved || denied || !requiresHumanReview} />
          <ActionButton label="Release Execution" tone="violet" onClick={() => setPendingAction('release')} disabled={(!approved && pendingStatus !== 'executing' && pendingStatus !== 'completed') || denied} />
          <ActionButton label="Deny" tone="danger" onClick={() => setPendingAction('deny')} disabled={denied} />
          <ActionButton label="Pause" tone="warn" onClick={() => setPendingAction('pause')} disabled={paused || denied} />
          <ActionButton label="Resume" tone="accent" onClick={() => setPendingAction('resume')} disabled={!paused || denied} />
        </div>
      </div>

      {pendingCopy ? (
        <div className="relative mt-4 rounded-2xl border border-accent/20 bg-accent/6 p-4 animate-rise-in">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-50">Confirm action</div>
              <div className="mt-1 text-sm text-slate-300">{pendingCopy}</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPendingAction(null)}
                className="rounded-2xl border border-line bg-ink/70 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-ink/90"
              >
                Cancel
              </button>
              <button
                onClick={() => pendingAction && confirmAction(pendingAction)}
                className="rounded-2xl border border-accent/35 bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent hover:bg-accent/15"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

const confirmationCopy: Record<Exclude<PendingAction, null>, string> = {
  approve: 'Approve the staged request and move it into an execution-authorized state.',
  release: 'Release execution authority so the prepared command can run inside the governed envelope.',
  deny: 'Deny the staged request and revoke further execution authority.',
  pause: 'Pause the workflow and hold movement until an operator resumes it.',
  resume: 'Resume the workflow from its paused state.',
};

function StatusChip({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'neutral' | 'accent' }) {
  const toneClass = tone === 'accent'
    ? 'border-accent/25 bg-accent/10 text-accent'
    : 'border-line bg-ink/75 text-slate-200';

  return (
    <div className={`inline-flex max-w-full min-w-0 rounded-full border px-3 py-1.5 text-xs ${toneClass}`}>
      <span className="text-muted">{label}:</span>{' '}
      <span className="font-medium text-slate-100 tp-wrap-anywhere">{value}</span>
    </div>
  );
}

function ActionButton({ label, tone, onClick, disabled = false }: { label: string; tone: 'success' | 'violet' | 'danger' | 'warn' | 'accent'; onClick: () => void; disabled?: boolean }) {
  const tones = {
    success: 'border-success/35 bg-success/10 text-success hover:bg-success/15',
    violet: 'border-violet/35 bg-violet/10 text-violet hover:bg-violet/15',
    danger: 'border-danger/35 bg-danger/10 text-danger hover:bg-danger/15',
    warn: 'border-warn/35 bg-warn/10 text-warn hover:bg-warn/15',
    accent: 'border-accent/35 bg-accent/10 text-accent hover:bg-accent/15',
  } as const;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-45 ${tones[tone]}`}
    >
      {label}
    </button>
  );
}
