"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { PostDetailPanel } from "@/components/PostDetailPanel";

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const fromNumber = from && /^\d+$/.test(from) ? Number(from) : null;

  return (
    <AuthGate>
      <main className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
        <Link
          href={fromNumber ? `/post/${fromNumber}` : "/"}
          className="mb-4 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {fromNumber ? `返回#${fromNumber}` : "返回广场"}
        </Link>
        <PostDetailPanel postId={params.id} />
      </main>
    </AuthGate>
  );
}
