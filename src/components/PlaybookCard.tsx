import type { Playbook } from '../types';

type Props = { playbook: Playbook };

export function PlaybookCard({ playbook }: Props) {
  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-6 shadow-panel">
      <h2 className="text-lg font-semibold text-slate-50">Playbook</h2>
      <div className="mt-5 space-y-5 text-sm text-slate-200">
        <Block title="Trigger" content={playbook.trigger} />
        <ListBlock title="Preconditions" items={playbook.preconditions} />
        <ListBlock title="Allowed tools" items={playbook.allowedTools} />
        <Block title="Approval requirement" content={playbook.approvalRequirement} />
        <Block title="Rollback path" content={playbook.rollback} />
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

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.18em] text-muted">{title}</div>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="rounded-2xl border border-line bg-ink/60 px-4 py-3">{item}</li>
        ))}
      </ul>
    </div>
  );
}
