import type { TimelineCategory, InspectionRecord } from '../types';
import type { RequestTimelineEvent } from '../runtime/requestTypes';
import { SectionHeader, StatusBadge } from './ui';

type Props = {
  open: boolean;
  record: InspectionRecord;
  eventTitle: string;
  eventCategory: TimelineCategory;
  onToggle: () => void;
  requestEvent?: RequestTimelineEvent | null;
};

export function InspectionDrawer({ open, record, eventTitle, eventCategory, onToggle, requestEvent }: Props) {
  const badgeLabel = requestEvent?.family ?? eventCategory;
  const titleLabel = requestEvent?.type ?? eventTitle;
  const eventDetails = requestEvent?.details;
  const artifactLinked = (requestEvent?.artifactRefs?.length ?? 0) > 0;
  return (
    <section className="rounded-3xl border border-line bg-panel/95 shadow-panel">
      <button
        onClick={onToggle}
        className="flex w-full min-w-0 flex-wrap items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <SectionHeader
          title="Inspection evidence"
          description="Focused details for the currently selected timeline event."
          meta={<StatusBadge tone="accent">{record.title}</StatusBadge>}
        />
        <span className="text-sm text-accent">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open ? (
        <div className="border-t border-line px-6 pb-6 pt-5 animate-rise-in">
          <div className="selected-surface mb-4 rounded-2xl border border-accent/20 bg-accent/6 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="violet">linked evidence</StatusBadge>
              <StatusBadge>{badgeLabel}</StatusBadge>
              {artifactLinked ? <StatusBadge tone="accent">artifact linked</StatusBadge> : null}
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-100 tp-wrap-anywhere">{titleLabel}</div>
          </div>
          {eventDetails ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {Object.entries(eventDetails).map(([key, value]) => (
                <StatusBadge key={key}>{key}: {Array.isArray(value) ? value.join(', ') : String(value)}</StatusBadge>
              ))}
            </div>
          ) : null}
          <div className="mb-3 text-sm font-semibold text-slate-100 tp-wrap-anywhere">{record.title}</div>
          <pre className="tp-pretty-wrap overflow-x-auto rounded-2xl border border-line bg-ink/70 p-4 text-xs leading-6 text-slate-200">{record.content}</pre>
        </div>
      ) : null}
    </section>
  );
}
