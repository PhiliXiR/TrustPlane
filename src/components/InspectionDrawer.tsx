import type { InspectionRecord } from '../types';

type Props = {
  open: boolean;
  record: InspectionRecord;
  onToggle: () => void;
};

export function InspectionDrawer({ open, record, onToggle }: Props) {
  return (
    <section className="rounded-3xl border border-line bg-panel/95 shadow-panel">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-50">Inspection Drawer</h2>
          <p className="mt-1 text-sm text-muted">Secondary runtime details and raw envelopes.</p>
        </div>
        <span className="text-sm text-accent">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open ? (
        <div className="border-t border-line px-6 pb-6 pt-4">
          <div className="mb-3 text-sm font-semibold text-slate-100">{record.title}</div>
          <pre className="overflow-x-auto rounded-2xl border border-line bg-ink/70 p-4 text-xs leading-6 text-slate-200">{record.content}</pre>
        </div>
      ) : null}
    </section>
  );
}
