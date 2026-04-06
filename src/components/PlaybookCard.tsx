import type { Playbook } from '../types';
import type { IntakeExampleFixture } from '../runtime/exampleTypes';
import type { RequestSnapshot } from '../runtime/requestTypes';
import { derivePlaybookSummary } from '../runtime/requestViewAdapters';
import { SectionHeader, StatusBadge, SurfaceCard } from './ui';

type Props = { playbook: Playbook; snapshot?: RequestSnapshot | null; example?: IntakeExampleFixture | null };

export function PlaybookCard({ playbook, snapshot, example }: Props) {
  const resolvedPlaybook = derivePlaybookSummary(snapshot, playbook);
  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-6 shadow-panel">
      <SectionHeader
        title="Playbook"
        meta={<div className="flex flex-wrap gap-2"><StatusBadge>{resolvedPlaybook.allowedTools.length} tools</StatusBadge>{example ? <StatusBadge tone="warn">example</StatusBadge> : null}</div>}
      />

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.85fr_1.15fr] text-sm text-slate-200">
        <div className="space-y-5">
          <SurfaceCard>
            <Block title="Trigger" content={resolvedPlaybook.trigger} />
          </SurfaceCard>
          <SurfaceCard>
            <Block title="Approval requirement" content={resolvedPlaybook.approvalRequirement} />
          </SurfaceCard>
          <SurfaceCard>
            <Block title="Rollback path" content={resolvedPlaybook.rollback} />
          </SurfaceCard>
        </div>

        <div className="space-y-5">
          <SurfaceCard>
            <ListBlock title="Preconditions" items={resolvedPlaybook.preconditions} emptyLabel="No explicit preconditions listed." />
          </SurfaceCard>
          <SurfaceCard>
            <ListBlock title="Allowed tools" items={resolvedPlaybook.allowedTools} emptyLabel="No tools declared." />
          </SurfaceCard>
        </div>
      </div>
    </section>
  );
}

function Block({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.18em] text-muted">{title}</div>
      <div className="mt-2 leading-7">{content}</div>
    </div>
  );
}

function ListBlock({ title, items, emptyLabel }: { title: string; items: string[]; emptyLabel: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.18em] text-muted">{title}</div>
      <ul className="mt-2 space-y-2">
        {items.length === 0 ? (
          <li className="rounded-2xl border border-line bg-ink/45 px-4 py-3 text-slate-400">{emptyLabel}</li>
        ) : (
          items.map((item) => (
            <li key={item} className="rounded-2xl border border-line bg-ink/60 px-4 py-3">{item}</li>
          ))
        )}
      </ul>
    </div>
  );
}
