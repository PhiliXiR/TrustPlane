export function ApprovalBar() {
  return (
    <section className="rounded-3xl border border-line bg-panel/95 p-4 shadow-panel">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-100">Human intervention points</div>
          <div className="mt-1 text-sm text-muted">Mocked control surface for operator oversight. No action is executed without governed approval.</div>
        </div>
        <div className="flex flex-wrap gap-3">
          <ActionButton label="Approve" tone="border-success/35 bg-success/10 text-success" />
          <ActionButton label="Deny" tone="border-danger/35 bg-danger/10 text-danger" />
          <ActionButton label="Pause" tone="border-warn/35 bg-warn/10 text-warn" />
          <ActionButton label="Resume" tone="border-accent/35 bg-accent/10 text-accent" />
        </div>
      </div>
    </section>
  );
}

function ActionButton({ label, tone }: { label: string; tone: string }) {
  return <button className={`rounded-2xl border px-4 py-2 text-sm font-medium ${tone}`}>{label}</button>;
}
