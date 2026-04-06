import type { Stage } from '../types';
import type { RequestSnapshot } from '../runtime/requestTypes';
import { SectionHeader, StatusBadge, SurfaceCard } from './ui';

type Props = { stage: Stage; snapshot?: RequestSnapshot | null };

export function DecisionPanel({ stage, snapshot }: Props) {
  const currentSummary = snapshot?.workflowState.stateReason ?? stage.explanation;
  const policyBasis = snapshot?.policyDecision.basis ?? stage.rule;
  const evidenceItems = snapshot
    ? [
        `policyDecision=${snapshot.policyDecision.decision}`,
        `pendingAction=${snapshot.pendingAction.actionType}`,
        `requiresHumanReview=${String(snapshot.policyDecision.requiresHumanReview)}`,
        `verificationStatus=${snapshot.verificationState.status}`,
      ]
    : stage.evidence;
  const nextStep = snapshot?.workflowState.nextStep ?? stage.next;
  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-6 shadow-panel">
      <SectionHeader
        title="Decision explanation"
        meta={<StatusBadge tone="accent">{stage.label}</StatusBadge>}
      />

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <SurfaceCard>
          <Block title="What is happening right now?" content={currentSummary} />
        </SurfaceCard>
        <SurfaceCard>
          <Block title="Why is it allowed?" content={policyBasis} />
        </SurfaceCard>
      </div>

      <SurfaceCard className="mt-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Evidence used</h3>
        <ul className="mt-3 grid gap-2">
          {evidenceItems.map((item) => (
            <li key={item} className="rounded-2xl border border-line bg-ink/60 px-4 py-3 text-sm text-slate-200">
              {item}
            </li>
          ))}
        </ul>
      </SurfaceCard>

      <SurfaceCard className="mt-5">
        <Block title="What happens next?" content={nextStep} />
      </SurfaceCard>
    </section>
  );
}

function Block({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-200">{content}</p>
    </div>
  );
}
