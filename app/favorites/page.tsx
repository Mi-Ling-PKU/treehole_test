"use client";

import { AuthGate } from "@/components/AuthGate";
import { PostBoard } from "@/components/PostBoard";

export default function FavoritesPage() {
  return (
    <AuthGate>
      <PostBoard mode="favorites" title="我的关注" description="你关注的树洞会保存在这里，方便之后继续查看和回复。" />
    </AuthGate>
  );
}
