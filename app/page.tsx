"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { PostBoard } from "@/components/PostBoard";

export default function HomePage() {
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <AuthGate
      barMaxWidthClassName="max-w-3xl"
      action={
        <button
          type="button"
          onClick={() => setComposerOpen(true)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-moss text-white hover:bg-moss/90"
          aria-label="发布树洞"
          title="发布树洞"
        >
          <Plus size={22} aria-hidden="true" />
        </button>
      }
    >
      <PostBoard
        mode="all"
        showComposer
        layout="centered"
        composerOpen={composerOpen}
        onComposerOpenChange={setComposerOpen}
      />
    </AuthGate>
  );
}
