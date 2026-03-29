import type { Stage } from '../types';

type Props = { stage: Stage };

export function DecisionPanel({ stage }: Props) {
  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-6 shadow-panel">
      <h2 className="text-lg font-semibold text-slate-50">Decision Explanation</h2>
      <div className="mt-5 space-y-5">
        <Block title="What is happening right now?" content={stage.explanation} />
        <Block title="Why is it allowed?" content={stage.rule} />
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Evidence used</h3>
          <ul className="mt-3 space-y-2">
            {stage.evidence.map((item) => (
              <li key={item} className="rounded-2xl border border-line bg-ink/60 px-4 py-3 text-sm text-slate-200">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Block title="What happens next?" content={stage.next} />
      </div>
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
