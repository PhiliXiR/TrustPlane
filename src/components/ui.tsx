export function SectionHeader({
  title,
  description,
  meta,
}: {
  title: string;
  description?: string;
  meta?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h2 className="text-[1.02rem] font-semibold tracking-[-0.01em] text-slate-50">{title}</h2>
        {description ? <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {meta ? <div className="min-w-0 shrink-0 tp-wrap-anywhere">{meta}</div> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  tone = 'default',
  emphasis = 'normal',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'accent' | 'violet' | 'success';
  emphasis?: 'normal' | 'strong';
}) {
  const toneClass = tone === 'accent'
    ? 'border-accent/20 bg-accent/8'
    : tone === 'violet'
      ? 'border-violet/20 bg-violet/8'
      : tone === 'success'
        ? 'border-success/20 bg-success/8'
        : 'border-line bg-panel/85';

  return (
    <div className={`min-w-0 rounded-2xl border px-4 py-3 shadow-panel ${toneClass} ${emphasis === 'strong' ? 'relative overflow-hidden' : ''}`}>
      {emphasis === 'strong' ? <div className="metric-glow" aria-hidden="true" /> : null}
      <div className="relative text-[11px] uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className={`relative mt-1 font-semibold text-slate-100 tp-wrap-anywhere ${emphasis === 'strong' ? 'text-base' : 'text-sm'}`}>{value}</div>
    </div>
  );
}

export function StatusBadge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'accent' | 'warn' | 'success' | 'violet' }) {
  const toneClass = tone === 'accent'
    ? 'border-accent/25 bg-accent/10 text-accent'
    : tone === 'warn'
      ? 'border-warn/30 bg-warn/10 text-warn'
      : tone === 'success'
        ? 'border-success/25 bg-success/10 text-success'
        : tone === 'violet'
          ? 'border-violet/25 bg-violet/10 text-violet'
          : 'border-line bg-panel/45 text-slate-300';

  return <span className={`inline-flex max-w-full min-w-0 items-center rounded-full border px-3 py-1 text-[11px] font-medium tracking-[0.01em] tp-wrap-anywhere ${toneClass}`}>{children}</span>;
}

export function SurfaceCard({
  children,
  tone = 'default',
  className = '',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'accent' | 'violet';
  className?: string;
}) {
  const toneClass = tone === 'accent'
    ? 'border-accent/20 bg-accent/6'
    : tone === 'violet'
      ? 'border-violet/20 bg-violet/6'
      : 'border-line bg-ink/55';

  return <div className={`min-w-0 rounded-3xl border p-5 ${toneClass} ${className}`}>{children}</div>;
}
