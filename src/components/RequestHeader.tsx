import type { RequestModel } from '../types';
import type { IntakeExampleFixture } from '../runtime/exampleTypes';
import type { RequestSnapshot } from '../runtime/requestTypes';
import { SectionHeader, StatusBadge, SurfaceCard } from './ui';

type Props = {
  request: RequestModel;
  trustModel: {
    level: string;
    currentBoundary: string;
    delegationRule: string;
    downgradeRule: string;
  };
  snapshot?: RequestSnapshot | null;
  example?: IntakeExampleFixture | null;
};

const pillStyles: Record<string, string> = {
  medium: 'border-warn/30 text-warn bg-warn/10',
  high: 'border-danger/30 text-danger bg-danger/10',
  unknown: 'border-line text-slate-200 bg-panel/40',
  restricted: 'border-amber-400/30 text-amber-200 bg-amber-400/10',
  moderate: 'border-accent/30 text-accent bg-accent/10',
  elevated: 'border-emerald-400/30 text-emerald-200 bg-emerald-400/10',
  'human-approved execution': 'border-accent/30 text-accent bg-accent/10',
};

export function RequestHeader({ request, trustModel, snapshot, example }: Props) {
  const intake = request.intake;
  const workflow = snapshot?.request.workflowCandidate ?? intake?.candidateWorkflows[0] ?? 'unclassified_intake';
  const trustLevel = snapshot?.trustState.trustLevel ?? trustModel.level.toLowerCase();
  const trustTone = pillStyles[trustLevel.toLowerCase()] ?? 'border-violet/30 text-violet bg-violet/10';
  const requestState = snapshot?.request.currentState ?? request.state;
  const currentOwner = snapshot?.request.currentOwner ?? request.owner;
  const autonomyMode = snapshot?.request.delegationMode ?? request.autonomyMode;
  const trustBoundary = snapshot ? `${snapshot.trustState.delegationMode} · ${snapshot.trustState.executionMode}` : trustModel.currentBoundary;
  const delegationRule = snapshot?.trustState.why ?? trustModel.delegationRule;
  const downgradeRule = snapshot?.trustState.downgradeTriggers.join('; ') || trustModel.downgradeRule;

  return (
    <section className="overflow-hidden rounded-[30px] border border-line bg-panel/95 p-6 shadow-panel lg:p-7">
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-5">
          <div className="hero-surface rounded-[28px] border border-accent/15 bg-[radial-gradient(circle_at_top_left,rgba(143,208,255,0.14),transparent_45%),linear-gradient(180deg,rgba(8,16,24,0.84),rgba(8,16,24,0.34))] p-5 lg:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent">TrustPlane</p>
            <h1 className="text-[2rem] font-semibold tracking-tight text-slate-50 sm:text-[2.2rem] lg:text-[2.7rem] tp-wrap-anywhere">{request.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              A governed execution record showing who owns the request, what authority is currently in play, and what can happen next.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge tone="accent">Execution record</StatusBadge>
              <StatusBadge tone="violet">Human-governed</StatusBadge>
              <StatusBadge tone="success">Operator-visible</StatusBadge>
              {example ? <StatusBadge tone="warn">Example mode</StatusBadge> : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatusPill label="Current state" value={requestState} />
            <StatusPill label="Current owner" value={currentOwner} />
            <StatusPill label="Risk level" value={request.risk} tone={pillStyles[request.risk.toLowerCase()] ?? pillStyles.unknown} />
            <StatusPill label="Autonomy mode" value={autonomyMode} tone={pillStyles[autonomyMode.toLowerCase()] ?? pillStyles.unknown} />
          </div>

          {intake ? (
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <SurfaceCard>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-accent">Intake summary</div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${trustTone}`}>
                    {(snapshot?.intakeStatus.initialTrustPosture ?? intake.initialTrustMode).split('_').join(' ')}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <MetaCard label="Request ID" value={intake.requestId} />
                  <MetaCard label="Source" value={intake.source} />
                  <MetaCard label="Requester" value={intake.requester} />
                  <MetaCard label="Workflow" value={workflow} />
                  <MetaCard label="Normalized type" value={intake.normalizedType.split('_').join(' ')} />
                  <MetaCard label="Target system" value={intake.targetSystem} />
                </div>
              </SurfaceCard>

              <SurfaceCard>
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted">Request context</div>
                <div className="mt-3 text-sm leading-7 text-slate-100">{intake.rawRequest}</div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Chip>{intake.clarificationNeeded ? 'Clarification needed' : 'Ready for routing'}</Chip>
                  <Chip>{workflow}</Chip>
                  <Chip>{intake.targetSystem}</Chip>
                  {intake.requestedEntitlement ? <Chip>{intake.requestedEntitlement}</Chip> : null}
                  {intake.missingFields.map((field) => (
                    <Chip key={field} tone="warn">missing: {field}</Chip>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-line bg-panel/40 px-4 py-4 text-sm leading-6 text-slate-300">
                  <span className="font-semibold text-slate-100">Business reason:</span>{' '}
                  {intake.businessReason ?? 'Not captured yet'}
                </div>
              </SurfaceCard>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <SurfaceCard tone="violet" className="bg-[linear-gradient(180deg,rgba(112,86,255,0.14),rgba(112,86,255,0.06))]">
            <SectionHeader
              title="Trust boundary"
              description={trustBoundary}
              meta={<StatusBadge tone="violet">{snapshot?.trustState.trustLevel ?? trustModel.level}</StatusBadge>}
            />
          </SurfaceCard>

          <SurfaceCard>
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted">Authority rules</div>
            <div className="mt-4 space-y-4 text-sm leading-6 text-slate-300">
              <RuleBlock title="Delegation rule" content={delegationRule} />
              <RuleBlock title="Downgrade path" content={downgradeRule} />
            </div>
          </SurfaceCard>
        </div>
      </div>
    </section>
  );
}

function StatusPill({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className={`min-w-0 rounded-2xl border border-line bg-ink/70 px-4 py-3 ${tone ?? ''}`}>
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-100 tp-wrap-anywhere">{value}</div>
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-panel/45 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-100 tp-wrap-anywhere">{value}</div>
    </div>
  );
}

function RuleBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel/40 px-4 py-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-200 tp-wrap-anywhere">{content}</div>
    </div>
  );
}

function Chip({ children, tone = 'accent' }: { children: React.ReactNode; tone?: 'accent' | 'warn' }) {
  const toneClass = tone === 'warn'
    ? 'border-warn/30 bg-warn/10 text-warn'
    : 'border-accent/25 bg-accent/10 text-accent';

  return <span className={`inline-flex max-w-full min-w-0 rounded-full border px-3 py-1 text-xs font-medium tp-wrap-anywhere ${toneClass}`}>{children}</span>;
}
