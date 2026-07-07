"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { PostDetailPanel } from "@/components/PostDetailPanel";

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <AuthGate>
      <main className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
        <Link href="/" className="mb-4 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-ink/60 hover:bg-mist hover:text-ink">
          <ArrowLeft size={16} aria-hidden="true" />
          返回广场
        </Link>
        <PostDetailPanel postId={params.id} />
      </main>
    </AuthGate>
  );
}
