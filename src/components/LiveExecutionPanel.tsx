import { useEffect, useRef } from 'react';
import type { IntakeExampleFixture } from '../runtime/exampleTypes';
import { SectionHeader, StatusBadge } from './ui';

type ExecutionLogEntry = {
  id: string;
  stream: 'stdout' | 'stderr';
  message: string;
};

type Props = {
  entries: ExecutionLogEntry[];
  example?: IntakeExampleFixture | null;
};

export function LiveExecutionPanel({ entries, example }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [entries]);

  const live = entries.length > 0;
  const title = example ? 'Expected execution evidence' : 'Execution evidence';
  const description = example
    ? 'When an example is selected, this panel shows the expected execution and evidence story for that record.'
    : 'Watch execution evidence arrive in real time as the current governed path runs.';

  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-6 shadow-panel">
      <SectionHeader
        title={title}
        description={description}
        meta={
          <div className="flex items-center gap-2">
            <StatusBadge tone={example ? 'warn' : live ? 'success' : 'neutral'}>{example ? 'example' : live ? 'streaming' : 'idle'}</StatusBadge>
            <StatusBadge>{entries.length} line{entries.length === 1 ? '' : 's'}</StatusBadge>
          </div>
        }
      />
      <div ref={containerRef} className="mt-5 max-h-[320px] overflow-auto rounded-2xl border border-line bg-ink/75 p-4 font-mono text-xs leading-6 text-slate-200">
        {entries.length === 0 ? (
          <div className="text-muted">{example ? 'No live output for this example. Use the timeline and evidence context above.' : 'No execution evidence yet.'}</div>
        ) : (
          entries.map((entry, index) => (
            <div key={entry.id} className={`grid min-w-0 grid-cols-[auto_auto_minmax(0,1fr)] gap-3 ${entry.stream === 'stderr' ? 'text-amber-300' : 'text-slate-200'}`}>
              <span className="text-muted">{String(index + 1).padStart(2, '0')}</span>
              <span className="text-muted">[{entry.stream}]</span>
              <span className="tp-pretty-wrap">{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
