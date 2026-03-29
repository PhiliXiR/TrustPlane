type Option = { id: string; label: string };

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
};

export function ScenarioSelector({ options, value, onChange }: Props) {
  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-4 shadow-panel">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-100">Scenario</div>
          <div className="mt-1 text-sm text-muted">Switch between governed runtime patterns without changing the control-plane shape.</div>
        </div>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-2xl border border-line bg-ink px-4 py-3 text-sm text-slate-100 outline-none"
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
