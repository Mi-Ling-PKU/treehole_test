"use client";

import { AuthGate } from "@/components/AuthGate";
import { PostBoard } from "@/components/PostBoard";

export default function HomePage() {
  return (
    <AuthGate>
      <PostBoard mode="all" showComposer layout="centered" />
    </AuthGate>
  );
}
