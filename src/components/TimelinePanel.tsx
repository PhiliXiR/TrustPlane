import type { TimelineEvent } from '../types';

type Props = {
  timeline: TimelineEvent[];
  selectedEventId: string;
  onSelect: (id: string) => void;
};

export function TimelinePanel({ timeline, selectedEventId, onSelect }: Props) {
  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-6 shadow-panel">
      <h2 className="text-lg font-semibold text-slate-50">Timeline</h2>
      <div className="mt-5 space-y-3">
        {timeline.map((event) => {
          const selected = event.id === selectedEventId;
          return (
            <button
              key={event.id}
              onClick={() => onSelect(event.id)}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition-all ${selected ? 'border-accent/40 bg-accent/10 ring-1 ring-accent/40' : 'border-line bg-ink/55'}`}
            >
              <div className="flex items-start gap-4">
                <div className="min-w-[56px] text-sm font-medium text-accent">{event.time}</div>
                <div>
                  <div className="text-sm font-semibold text-slate-100">{event.title}</div>
                  <div className="mt-1 text-sm leading-6 text-muted">{event.detail}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
