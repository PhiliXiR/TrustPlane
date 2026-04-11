import type { TimelineEvent } from '../types';
import type { IntakeExampleFixture } from '../runtime/exampleTypes';
import type { RequestTimelineEvent } from '../runtime/requestTypes';
import { SectionHeader, StatusBadge } from './ui';

type Props = {
  timeline: TimelineEvent[];
  selectedEventId: string;
  onSelect: (id: string) => void;
  requestTimeline?: RequestTimelineEvent[] | null;
  example?: IntakeExampleFixture | null;
};

const categoryTone: Record<TimelineEvent['category'], 'accent' | 'violet' | 'success' | 'warn' | 'neutral'> = {
  request: 'neutral',
  workflow: 'accent',
  policy: 'violet',
  human: 'warn',
  tool: 'success',
  verification: 'accent',
  artifact: 'violet',
};

const familyTone: Record<RequestTimelineEvent['family'], 'accent' | 'violet' | 'success' | 'warn' | 'neutral'> = {
  intake: 'neutral',
  workflow: 'accent',
  policy: 'violet',
  human_checkpoint: 'warn',
  execution: 'success',
  verification: 'accent',
  artifact: 'violet',
  trust: 'violet',
  ownership: 'accent',
};

export function TimelinePanel({ timeline, selectedEventId, onSelect, requestTimeline, example }: Props) {
  const projected = requestTimeline && requestTimeline.length > 0;
  const selectedEvent = projected
    ? requestTimeline.find((event) => event.eventId === selectedEventId) ?? requestTimeline[requestTimeline.length - 1]
    : timeline.find((event) => event.id === selectedEventId) ?? timeline[timeline.length - 1];

  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-6 shadow-panel">
      <SectionHeader
        title="Action timeline"
        description="Select an event to inspect the evidence, authority context, and record details attached to it."
        meta={<div className="flex flex-wrap gap-2"><StatusBadge>{projected ? requestTimeline?.length ?? 0 : timeline.length} events</StatusBadge>{example ? <StatusBadge tone="warn">example</StatusBadge> : null}</div>}
      />

      {selectedEvent ? (
        <div className="mt-5 rounded-2xl border border-accent/20 bg-accent/6 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={projected ? familyTone[(selectedEvent as RequestTimelineEvent).family] : categoryTone[(selectedEvent as TimelineEvent).category]}>
              {projected ? (selectedEvent as RequestTimelineEvent).family : (selectedEvent as TimelineEvent).category}
            </StatusBadge>
            <span className="text-sm font-semibold text-slate-100">Selected event</span>
            <span className="text-xs uppercase tracking-[0.14em] text-muted">{projected ? (selectedEvent as RequestTimelineEvent).timestamp : (selectedEvent as TimelineEvent).time}</span>
          </div>
          <div className="mt-2 text-sm leading-6 text-slate-200 tp-wrap-anywhere">{projected ? (selectedEvent as RequestTimelineEvent).type : (selectedEvent as TimelineEvent).title}</div>
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {(projected ? requestTimeline! : timeline).map((event, index, events) => {
          const eventId = projected ? (event as RequestTimelineEvent).eventId : (event as TimelineEvent).id;
          const selected = eventId === selectedEventId;
          return (
            <div key={eventId} className="flex gap-3">
              <div className="flex w-8 shrink-0 flex-col items-center pt-2">
                <div className={`h-2.5 w-2.5 rounded-full ${selected ? 'bg-accent shadow-[0_0_0_6px_rgba(143,208,255,0.10)]' : 'bg-slate-500'}`} />
                {index < events.length - 1 ? <div className="mt-2 h-full w-px bg-line/80" /> : null}
              </div>
              <button
                onClick={() => onSelect(eventId)}
                className={`w-full min-w-0 rounded-2xl border px-4 py-4 text-left transition-all ${selected ? 'selected-surface border-accent/40 bg-accent/10 ring-1 ring-accent/40' : 'border-line bg-ink/55 hover:border-line/80 hover:bg-ink/75'}`}
              >
                <div className="flex items-start gap-4">
                  <div className="min-w-[56px] max-w-[84px] pt-0.5 text-sm font-medium text-accent tp-wrap-anywhere">{projected ? (event as RequestTimelineEvent).timestamp : (event as TimelineEvent).time}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={projected ? familyTone[(event as RequestTimelineEvent).family] : categoryTone[(event as TimelineEvent).category]}>
                        {projected ? (event as RequestTimelineEvent).family : (event as TimelineEvent).category}
                      </StatusBadge>
                      <div className="text-sm font-semibold text-slate-100 tp-wrap-anywhere">{projected ? (event as RequestTimelineEvent).type : (event as TimelineEvent).title}</div>
                    </div>
                    <div className="mt-2 text-sm leading-6 text-muted tp-wrap-anywhere">{projected ? (event as RequestTimelineEvent).summary : (event as TimelineEvent).detail}</div>
                    {projected ? <div className="mt-2 text-xs uppercase tracking-[0.14em] text-muted">actor: {(event as RequestTimelineEvent).actor}</div> : null}
                    {selected ? <div className="mt-3 text-xs uppercase tracking-[0.14em] text-accent">Evidence panel synced below</div> : null}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
