import type { IntakeExampleFixture, IntakeExampleSummary } from '../runtime/exampleTypes';
import { SectionHeader, StatusBadge, SurfaceCard } from './ui';

type Props = {
  examples: IntakeExampleSummary[];
  selectedExampleId: string;
  selectedExample: IntakeExampleFixture | null;
  onSelect: (exampleId: string) => void;
};

export function ExamplesPanel({ examples, selectedExampleId, selectedExample, onSelect }: Props) {
  return (
    <SurfaceCard>
      <SectionHeader
        title="Example Fixtures"
        description="Canonical example intake fixtures wired into the project for browsing and future test/regression use."
        meta={<StatusBadge tone="violet">examples</StatusBadge>}
      />

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-2">
          {examples.map((example) => {
            const selected = example.exampleId === selectedExampleId;
            return (
              <button
                key={example.exampleId}
                onClick={() => onSelect(example.exampleId)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${selected ? 'selected-surface border-accent/40 bg-accent/10 ring-1 ring-accent/40' : 'border-line bg-ink/50 hover:border-line/80 hover:bg-ink/75'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-100 tp-wrap-anywhere">{example.label}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">{example.category}</div>
                  </div>
                  <StatusBadge tone="accent">example</StatusBadge>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-line bg-ink/45 p-4">
          {selectedExample ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted">Raw intake</div>
                <div className="mt-2 text-sm leading-6 text-slate-200 tp-wrap-anywhere">{selectedExample.rawIntakeMessage}</div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted">Clarification</div>
                  <div className="mt-2 text-sm text-slate-200">{selectedExample.clarification.needed ? 'Needed' : 'Not needed'}</div>
                  <div className="mt-1 text-sm leading-6 text-muted tp-wrap-anywhere">{selectedExample.clarification.reason}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted">Expected workflow</div>
                  <div className="mt-2 text-sm text-slate-200 tp-wrap-anywhere">{selectedExample.expectedTrustPlane.workflowCandidate}</div>
                  <div className="mt-1 text-sm text-muted tp-wrap-anywhere">Trust: {selectedExample.expectedTrustPlane.trustLevel}</div>
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted">Expected timeline</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedExample.expectedTimelineEvents.map((eventType) => (
                    <StatusBadge key={eventType}>{eventType}</StatusBadge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted">Expected evidence</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedExample.expectedEvidenceArtifacts.map((artifact) => (
                    <StatusBadge key={artifact} tone="violet">{artifact}</StatusBadge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted">Select an example fixture to inspect it.</div>
          )}
        </div>
      </div>
    </SurfaceCard>
  );
}
