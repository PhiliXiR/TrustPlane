import { MetricCard, SectionHeader } from './ui';

type SourceOption = {
  id: string;
  label: string;
  kind: 'runtime' | 'example';
  category?: string;
  hero?: boolean;
};

type Props = {
  options: SourceOption[];
  value: string;
  onChange: (value: string) => void;
};

export function SourceSelector({ options, value, onChange }: Props) {
  const selected = options.find((option) => option.id === value);
  const runtimeCount = options.filter((option) => option.kind === 'runtime').length;
  const exampleCount = options.filter((option) => option.kind === 'example').length;
  const heroCount = options.filter((option) => option.hero).length;

  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-5 shadow-panel">
      <SectionHeader
        title="Record source"
        description="Choose the current Execution Record source. Lead with live runtime flows, then use examples as curated supporting records."
      />

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_minmax(120px,0.55fr)_minmax(120px,0.55fr)_minmax(120px,0.55fr)_minmax(320px,1.2fr)] xl:items-end">
        <MetricCard label="Current record" value={selected?.label ?? value} emphasis="strong" />
        <MetricCard label="Hero flows" value={String(heroCount)} tone="success" />
        <MetricCard label="Live runtime" value={String(runtimeCount)} tone="accent" />
        <MetricCard label="Examples" value={String(exampleCount)} tone="violet" />
        <label className="min-w-0 rounded-2xl border border-line bg-ink/70 px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Execution Record source</div>
          <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="mt-1 w-full rounded-xl border border-line/70 bg-ink px-3 py-2 text-sm text-slate-100 outline-none"
          >
            {options.map((option) => {
              const optionLabel = option.kind === 'example'
                ? option.label.replace(/^Example:\s*/i, '')
                : option.label;

              return (
                <option key={option.id} value={option.id}>
                  {option.hero ? `⭐ ${optionLabel}` : option.kind === 'example' ? `🟣 Example · ${optionLabel}` : optionLabel}
                </option>
              );
            })}
          </select>
          {selected?.hero ? <div className="mt-2 text-xs text-accent">Recommended demo flow</div> : null}
          {selected?.category ? <div className="mt-1 text-xs text-muted">{selected.category}</div> : null}
        </label>
      </div>
    </section>
  );
}
