"use client";

import { AuthGate } from "@/components/AuthGate";
import { PostBoard } from "@/components/PostBoard";

export default function HomePage() {
  return (
    <AuthGate barMaxWidthClassName="max-w-3xl">
      <PostBoard mode="all" title="广场" showComposer layout="centered" />
    </AuthGate>
  );
}
