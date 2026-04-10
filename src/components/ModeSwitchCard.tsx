import type { IntakeExampleFixture } from '../runtime/exampleTypes';
import { SectionHeader, StatusBadge, SurfaceCard } from './ui';

type Props = {
  example: IntakeExampleFixture | null;
};

export function ModeSwitchCard({ example }: Props) {
  const inExampleMode = Boolean(example);

  return (
    <SurfaceCard tone={inExampleMode ? 'violet' : 'accent'}>
      <SectionHeader
        title={inExampleMode ? 'Example Mode' : 'Live Runtime Mode'}
        description={
          inExampleMode
            ? 'The current record is a canonical example fixture shown through the same operator-facing Execution Record surface used for live runtime records.'
            : 'The current record is sourced from the live TrustPlane runtime path and is the recommended mode for the hero demo flows.'
        }
        meta={<StatusBadge tone={inExampleMode ? 'warn' : 'success'}>{inExampleMode ? 'example active' : 'live runtime'}</StatusBadge>}
      />
      {example ? (
        <div className="mt-4 rounded-2xl border border-line bg-ink/55 px-4 py-4 text-sm text-slate-200">
          <div className="font-semibold text-slate-50 tp-wrap-anywhere">{example.label}</div>
          <div className="mt-1 text-muted tp-wrap-anywhere">{example.category}</div>
        </div>
      ) : null}
    </SurfaceCard>
  );
}
