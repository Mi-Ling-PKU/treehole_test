"use client";

import { X } from "lucide-react";

export function ComposerDrawer({
  title,
  preview,
  onClose,
  children
}: {
  title: string;
  preview?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-ink/10" onMouseDown={onClose}>
      <aside
        className="absolute inset-y-0 right-0 flex h-dvh w-full flex-col border-l border-ink/10 bg-panel shadow-soft sm:w-1/2"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-ink/55 hover:bg-mist hover:text-ink" aria-label="关闭">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {preview ? <div>{preview}</div> : null}
          <div className={preview ? "mt-4" : ""}>{children}</div>
        </div>
      </aside>
    </div>
  );
}
