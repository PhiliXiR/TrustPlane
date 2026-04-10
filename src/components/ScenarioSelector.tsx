import { MetricCard, SectionHeader } from './ui';

type Option = { id: string; label: string };

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
};

export function ScenarioSelector({ options, value, onChange }: Props) {
  const selected = options.find((option) => option.id === value);
  const intakeCount = options.filter((option) => option.id.startsWith('intake-')).length;
  const seededCount = options.length - intakeCount;

  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-5 shadow-panel">
      <SectionHeader
        title="Runtime view"
        description="Switch between seeded scenarios and live intake-backed records without losing the control-plane shape."
      />

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(190px,1fr)_minmax(140px,0.7fr)_minmax(140px,0.7fr)_minmax(300px,1.2fr)] xl:items-end">
        <MetricCard label="Current record" value={selected?.label ?? value} emphasis="strong" />
        <MetricCard label="Seeded" value={String(seededCount)} />
        <MetricCard label="Live intake" value={String(intakeCount)} tone="accent" />
        <label className="min-w-0 rounded-2xl border border-line bg-ink/70 px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Scenario</div>
          <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="mt-1 w-full rounded-xl border border-line/70 bg-ink px-3 py-2 text-sm text-slate-100 outline-none"
          >
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.id.startsWith('intake-') ? `🟢 ${option.label}` : option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
