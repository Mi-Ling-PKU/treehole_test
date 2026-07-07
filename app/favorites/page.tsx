"use client";

import { AuthGate } from "@/components/AuthGate";
import { PostBoard } from "@/components/PostBoard";

export default function FavoritesPage() {
  return (
    <AuthGate>
      <PostBoard mode="favorites" title="关注" layout="centered" />
    </AuthGate>
  );
}
