"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { EmptyState } from "@/components/EmptyState";
import { PostCard } from "@/components/PostCard";
import { listFavoritePosts } from "@/lib/data";
import type { PostListItem } from "@/lib/types";

export default function FavoritesPage() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadFavorites() {
    setLoading(true);
    setError(null);

    try {
      setPosts(await listFavoritePosts());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "暂时加载不了收藏，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <Link href="/" className="mb-4 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-ink/60 hover:bg-mist hover:text-ink">
        <ArrowLeft size={16} aria-hidden="true" />
        返回首页
      </Link>

      <AuthGate requireAuth>
        <div className="mb-5">
          <h1 className="text-2xl font-semibold text-ink">我的收藏</h1>
          <p className="mt-2 text-sm text-ink/60">你收藏的帖子会出现在这里。</p>
        </div>

        {loading ? <p className="text-sm text-ink/55">正在加载...</p> : null}
        {error ? <p className="rounded-md bg-clay/10 p-3 text-sm text-clay">{error}</p> : null}
        {!loading && !error && posts.length === 0 ? (
          <EmptyState title="还没有收藏" text="收藏帖子后，这里会出现内容。" />
        ) : null}
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onFavoriteChanged={loadFavorites} />
          ))}
        </div>
      </AuthGate>
    </main>
  );
}
