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
            ? 'The UI is currently highlighting a canonical example fixture alongside the live TrustPlane runtime surface.'
            : 'The UI is currently focused on the live TrustPlane runtime surface.'
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
