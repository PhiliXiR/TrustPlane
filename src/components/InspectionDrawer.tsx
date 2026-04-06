import type { TimelineCategory, InspectionRecord } from '../types';
import type { RequestSnapshot, RequestTimelineEvent } from '../runtime/requestTypes';
import { deriveEvidenceSummary } from '../runtime/requestViewAdapters';
import { SectionHeader, StatusBadge } from './ui';

type Props = {
  open: boolean;
  record: InspectionRecord;
  eventTitle: string;
  eventCategory: TimelineCategory;
  onToggle: () => void;
  requestEvent?: RequestTimelineEvent | null;
  snapshot?: RequestSnapshot | null;
};

export function InspectionDrawer({ open, record, eventTitle, eventCategory, onToggle, requestEvent, snapshot }: Props) {
  const evidence = deriveEvidenceSummary(snapshot, requestEvent, record);
  const badgeLabel = requestEvent?.family ?? eventCategory;
  const titleLabel = requestEvent?.type ?? eventTitle;
  const artifactLinked = evidence.artifactRefs.length > 0;
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
          {evidence.detailPairs.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {evidence.detailPairs.map(({ key, value }) => (
                <StatusBadge key={key}>{key}: {value}</StatusBadge>
              ))}
            </div>
          ) : null}
          <div className="mb-3 flex flex-wrap gap-2">
            <StatusBadge tone="accent">verification: {evidence.verificationStatus}</StatusBadge>
            {evidence.artifactTypes.map((artifactType) => (
              <StatusBadge key={artifactType}>{artifactType}</StatusBadge>
            ))}
          </div>
          {evidence.artifactHighlights.length > 0 ? (
            <div className="mb-3 rounded-2xl border border-line bg-ink/55 px-4 py-3 text-sm text-slate-300">
              <div className="text-xs uppercase tracking-[0.18em] text-muted">Artifact highlights</div>
              <ul className="mt-2 space-y-1">
                {evidence.artifactHighlights.map((item) => (
                  <li key={item} className="tp-wrap-anywhere">• {item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mb-3 text-sm font-semibold text-slate-100 tp-wrap-anywhere">{record.title}</div>
          <pre className="tp-pretty-wrap overflow-x-auto rounded-2xl border border-line bg-ink/70 p-4 text-xs leading-6 text-slate-200">{record.content}</pre>
        </div>
      ) : null}
    </section>
  );
}
