import type { RequestModel } from '../types';
import type { IntakeExampleFixture } from '../runtime/exampleTypes';
import type { RequestSnapshot } from '../runtime/requestTypes';

type Props = {
  request: RequestModel;
  snapshot?: RequestSnapshot | null;
  example?: IntakeExampleFixture | null;
};

export function IntakeSpotlightCard({ request, snapshot, example }: Props) {
  const intake = request.intake;

  if (!intake) {
    return null;
  }

  const workflow = snapshot?.request.workflowCandidate ?? intake.candidateWorkflows[0] ?? 'unclassified_intake';
  const trust = (snapshot?.intakeStatus.initialTrustPosture ?? intake.initialTrustMode).split('_').join(' ');
  const reason = String(snapshot?.request.normalizedRequest.businessReason ?? intake.businessReason ?? 'No business reason captured yet');

  return (
    <section className="rounded-[28px] border border-accent/30 bg-[linear-gradient(135deg,rgba(104,234,255,0.13),rgba(112,86,255,0.08))] p-5 shadow-panel lg:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-accent">{example ? 'Selected example intake' : 'Newest governed intake'}</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">{snapshot?.request.title ?? request.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">
            {(snapshot?.intakeStatus.clarificationNeeded ?? intake.clarificationNeeded)
              ? 'This intake record is visible, but still blocked on missing information before governed routing can proceed.'
              : 'This intake record was captured successfully and is now visible as a governed request with workflow, trust, and routing context.'}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-accent/20 bg-ink/55 px-4 py-3 text-right lg:max-w-[320px]">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Request ID</div>
          <div className="mt-1 text-sm font-semibold text-slate-50 tp-wrap-anywhere">{snapshot?.request.requestId ?? intake.requestId}</div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SpotlightMetric label="Source" value={snapshot?.request.source ?? intake.source} />
        <SpotlightMetric label="Workflow" value={workflow} />
        <SpotlightMetric label="Trust mode" value={trust} />
        <SpotlightMetric label="Requester" value={intake.requester} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-line bg-ink/55 px-4 py-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Why this matters</div>
          <div className="mt-2 text-sm leading-6 text-slate-100">{reason}</div>
        </div>
        <div className="rounded-2xl border border-line bg-ink/55 px-4 py-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Current intake signal</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <SignalPill tone={(snapshot?.intakeStatus.clarificationNeeded ?? intake.clarificationNeeded) ? 'warn' : 'accent'}>
              {(snapshot?.intakeStatus.clarificationNeeded ?? intake.clarificationNeeded) ? 'Needs clarification' : 'Accepted into governed flow'}
            </SignalPill>
            <SignalPill>{intake.normalizedType.split('_').join(' ')}</SignalPill>
            <SignalPill>{intake.targetSystem}</SignalPill>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpotlightMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-ink/55 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-50 tp-wrap-anywhere">{value}</div>
    </div>
  );
}

function SignalPill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'accent' | 'warn' | 'neutral' }) {
  const toneClass = tone === 'accent'
    ? 'border-accent/30 bg-accent/10 text-accent'
    : tone === 'warn'
      ? 'border-warn/30 bg-warn/10 text-warn'
      : 'border-line bg-panel/60 text-slate-200';

  return <span className={`rounded-full border px-3 py-1 text-xs font-medium ${toneClass}`}>{children}</span>;
}
