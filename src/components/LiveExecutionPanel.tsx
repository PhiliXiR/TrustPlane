type ExecutionLogEntry = {
  id: string;
  stream: 'stdout' | 'stderr';
  message: string;
};

type Props = {
  entries: ExecutionLogEntry[];
};

export function LiveExecutionPanel({ entries }: Props) {
  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-6 shadow-panel">
      <h2 className="text-lg font-semibold text-slate-50">Live Command Output</h2>
      <p className="mt-1 text-sm text-muted">Watch governed command execution in real time as the current operator path runs.</p>
      <div className="mt-5 max-h-[320px] overflow-auto rounded-2xl border border-line bg-ink/75 p-4 font-mono text-xs leading-6 text-slate-200">
        {entries.length === 0 ? (
          <div className="text-muted">No live command output yet.</div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className={entry.stream === 'stderr' ? 'text-amber-300' : 'text-slate-200'}>
              <span className="mr-2 text-muted">[{entry.stream}]</span>
              <span>{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
