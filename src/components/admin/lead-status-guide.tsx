export function LeadStatusGuide() {
  return (
    <div className="mb-6 rounded-lg border border-border bg-soft-gray/50 px-4 py-3 text-sm text-muted-foreground">
      <p className="font-medium text-navy mb-2">Lead status guide</p>
      <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
        <li>
          <strong className="text-foreground">New</strong> — Just submitted; not yet reviewed.
        </li>
        <li>
          <strong className="text-foreground">Contacted</strong> — Reached out; include in{" "}
          <strong>newsletter sends</strong>.
        </li>
        <li>
          <strong className="text-foreground">Qualified</strong> — A real opportunity worth pursuing.
        </li>
        <li>
          <strong className="text-foreground">Converted</strong> — Became a customer/member; include in{" "}
          <strong>newsletter sends</strong>.
        </li>
        <li>
          <strong className="text-foreground">Closed</strong> — Done or no longer active (won or lost).
        </li>
        <li>
          <strong className="text-foreground">Spam</strong> — Junk or abusive; hide from follow-up.
        </li>
      </ul>
    </div>
  );
}
