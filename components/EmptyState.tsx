import { Inbox } from "lucide-react";

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border border-dashed border-ink/20 bg-panel/60 p-8 text-center">
      <Inbox className="mx-auto mb-3 text-ink/35" size={32} aria-hidden="true" />
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-ink/60">{text}</p>
    </div>
  );
}
