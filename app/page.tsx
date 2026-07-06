"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { EmptyState } from "@/components/EmptyState";
import { PostCard } from "@/components/PostCard";
import { PostComposer } from "@/components/PostComposer";
import { listPosts } from "@/lib/data";
import type { PostListItem } from "@/lib/types";

export default function HomePage() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadPosts() {
    setLoading(true);
    setError(null);

    try {
      setPosts(await listPosts());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "暂时加载不了内容，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[340px_1fr]">
      <section className="lg:sticky lg:top-6 lg:self-start">
        <AuthGate>
          <PostComposer onCreated={loadPosts} />
        </AuthGate>
      </section>

      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">匿名树洞</h1>
          <p className="mt-2 text-sm leading-6 text-ink/60">公开页面只显示编号。登录后可以收藏、回复和发布树洞。</p>
        </div>

        {loading ? <p className="text-sm text-ink/55">正在加载...</p> : null}
        {error ? <p className="rounded-md bg-clay/10 p-3 text-sm text-clay">{error}</p> : null}
        {!loading && !error && posts.length === 0 ? (
          <EmptyState title="还没有树洞" text="登录后可以发布第一条内容。" />
        ) : null}
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onFavoriteChanged={loadPosts} />
          ))}
        </div>
      </section>
    </main>
  );
}
