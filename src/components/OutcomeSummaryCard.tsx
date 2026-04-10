import type { IntakeExampleFixture } from '../runtime/exampleTypes';
import type { RequestSnapshot } from '../runtime/requestTypes';
import { SectionHeader, StatusBadge, SurfaceCard } from './ui';

type Props = {
  snapshot?: RequestSnapshot | null;
  example?: IntakeExampleFixture | null;
};

export function OutcomeSummaryCard({ snapshot, example }: Props) {
  if (!snapshot) {
    return null;
  }

  const completed = snapshot.verificationState.status === 'passed';
  const failed = snapshot.verificationState.status === 'failed';
  const pending = !completed && !failed;

  const outcomeTone = completed ? 'success' : failed ? 'warn' : 'accent';
  const outcomeLabel = completed ? 'Verified outcome' : failed ? 'Verification issue' : 'Outcome in progress';
  const outcomeSummary = completed
    ? 'This Execution Record is complete. The intended action was governed, executed, verified, and captured with supporting evidence.'
    : failed
      ? 'This Execution Record reached verification but did not satisfy the expected outcome. Human follow-up is required.'
      : 'This Execution Record is still progressing through review, execution, or verification.';

  const normalized = snapshot.request.normalizedRequest;
  const artifactTypes = snapshot.artifactSummary.artifactTypes.length > 0 ? snapshot.artifactSummary.artifactTypes : ['no_artifacts_listed'];
  const highlights = snapshot.artifactSummary.highlights.length > 0 ? snapshot.artifactSummary.highlights : ['No artifact highlights attached yet.'];

  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-6 shadow-panel">
      <SectionHeader
        title="Outcome and evidence"
        description="A concise readout of what this record intended to do, what happened, and whether the result is verified."
        meta={
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={outcomeTone}>{outcomeLabel}</StatusBadge>
            {example ? <StatusBadge tone="warn">example</StatusBadge> : null}
          </div>
        }
      />

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <SurfaceCard tone={completed ? 'accent' : 'violet'}>
          <div className="text-xs uppercase tracking-[0.18em] text-muted">Record outcome</div>
          <div className="mt-3 text-lg font-semibold text-slate-50">{snapshot.request.currentState}</div>
          <div className="mt-3 text-sm leading-7 text-slate-200">{outcomeSummary}</div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MiniMetric label="Intent" value={String(normalized.type ?? snapshot.request.workflowCandidate)} />
            <MiniMetric label="Target" value={String(normalized.targetSystem ?? 'unknown target')} />
            <MiniMetric label="Review gate" value={snapshot.policyDecision.requiresHumanReview ? 'required' : 'not required'} />
            <MiniMetric label="Verification" value={snapshot.verificationState.status} />
          </div>
        </SurfaceCard>

        <div className="space-y-5">
          <SurfaceCard>
            <div className="text-xs uppercase tracking-[0.18em] text-muted">What happened</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              <li className="rounded-2xl border border-line bg-ink/55 px-4 py-3">Plan: {snapshot.request.workflowCandidate}</li>
              <li className="rounded-2xl border border-line bg-ink/55 px-4 py-3">Action: {snapshot.pendingAction.summary}</li>
              <li className="rounded-2xl border border-line bg-ink/55 px-4 py-3">Review: {snapshot.policyDecision.basis}</li>
              <li className="rounded-2xl border border-line bg-ink/55 px-4 py-3">Outcome: {snapshot.verificationState.summary}</li>
            </ul>
          </SurfaceCard>

          <SurfaceCard>
            <div className="text-xs uppercase tracking-[0.18em] text-muted">Evidence attached</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {artifactTypes.map((artifactType) => (
                <StatusBadge key={artifactType}>{artifactType}</StatusBadge>
              ))}
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              {highlights.map((item) => (
                <li key={item} className="rounded-2xl border border-line bg-ink/55 px-4 py-3 tp-wrap-anywhere">{item}</li>
              ))}
            </ul>
          </SurfaceCard>
        </div>
      </div>
    </section>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-ink/55 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-50 tp-wrap-anywhere">{value}</div>
    </div>
  );
}
