"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Plus, RotateCcw, Search, Settings2 } from "lucide-react";
import { ComposerDrawer } from "@/components/ComposerDrawer";
import { EmptyState } from "@/components/EmptyState";
import { PostCard } from "@/components/PostCard";
import { PostComposer } from "@/components/PostComposer";
import { PostDetailPanel } from "@/components/PostDetailPanel";
import { listPosts } from "@/lib/data";
import type { SearchScope } from "@/lib/data";
import type { PostSummary } from "@/lib/types";

export function PostBoard({
  mode,
  title,
  description,
  showComposer,
  composerOpen: controlledComposerOpen,
  onComposerOpenChange,
  layout = "split"
}: {
  mode: "all" | "favorites";
  title?: string;
  description?: string;
  showComposer?: boolean;
  composerOpen?: boolean;
  onComposerOpenChange?: (open: boolean) => void;
  layout?: "split" | "centered";
}) {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [searchScope, setSearchScope] = useState<SearchScope>("all");
  const [searchSettingsOpen, setSearchSettingsOpen] = useState(false);
  const [internalComposerOpen, setInternalComposerOpen] = useState(false);
  const [detailReplyOpen, setDetailReplyOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const composerOpen = controlledComposerOpen ?? internalComposerOpen;
  const setComposerOpen = onComposerOpenChange ?? setInternalComposerOpen;

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextPosts = await listPosts(activeQuery ? "search" : mode, activeQuery, searchScope);
      setPosts(nextPosts);
      setSelectedId((current) => {
        if (current && nextPosts.some((post) => post.id === current)) {
          return current;
        }
        return layout === "split" ? nextPosts[0]?.id ?? null : null;
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "暂时加载不了内容，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }, [activeQuery, layout, mode, searchScope]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveQuery(query.trim());
  }

  function clearSearch() {
    setQuery("");
    setActiveQuery("");
  }

  async function handleCreated() {
    setComposerOpen(false);
    await loadPosts();
  }

  function openPost(postId: string, withReplyBox = false) {
    setDetailReplyOpen(withReplyBox);
    setSelectedId(postId);
  }

  if (layout === "centered" && selectedId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="mb-4 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          返回广场
        </button>
        <PostDetailPanel
          postId={selectedId}
          initialReplyOpen={detailReplyOpen}
          onClose={() => setSelectedId(null)}
          onChanged={loadPosts}
        />
      </main>
    );
  }

  return (
    <main className={layout === "centered" ? "mx-auto max-w-3xl px-4 py-4 sm:px-6" : "mx-auto grid max-w-6xl gap-5 px-4 py-4 sm:px-6 lg:grid-cols-[360px_1fr]"}>
      <section className="space-y-4">
        {title || description ? (
          <div className="flex items-start justify-between gap-3">
            <div>
              {title ? <h1 className="text-2xl font-semibold text-white">{title}</h1> : null}
              {description ? <p className="mt-2 text-sm leading-6 text-white/75">{description}</p> : null}
            </div>
          </div>
        ) : null}

        {showComposer && composerOpen ? (
          <ComposerDrawer title="写新树洞" onClose={() => setComposerOpen(false)}>
            <PostComposer onCreated={handleCreated} surface="plain" draftKey="treehole:draft:new-post" />
          </ComposerDrawer>
        ) : null}

        <form onSubmit={submitSearch} className="flex flex-wrap items-center gap-2 rounded-md border border-ink/10 bg-panel/90 p-2 shadow-soft">
          {showComposer ? (
            <button
              type="button"
              onClick={() => setComposerOpen(true)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-moss text-white hover:bg-moss/90"
              aria-label="发布树洞"
              title="发布树洞"
            >
              <Plus size={22} aria-hidden="true" />
            </button>
          ) : null}
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchScope === "posts" ? "搜索树洞" : "搜索树洞和回复"}
            className="focus-ring min-w-0 flex-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-moss text-white hover:bg-moss/90"
            aria-label="搜索"
            title="搜索"
          >
            <Search size={16} aria-hidden="true" />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setSearchSettingsOpen((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink/10 bg-panel text-ink/70 hover:bg-mist hover:text-ink"
              aria-label="搜索设置"
              title="搜索设置"
            >
              <Settings2 size={16} aria-hidden="true" />
            </button>
            {searchSettingsOpen ? (
              <div className="absolute right-0 top-11 z-20 w-40 rounded-md border border-ink/10 bg-panel p-1 text-sm shadow-soft">
                <button
                  type="button"
                  onClick={() => {
                    setSearchScope("posts");
                    setSearchSettingsOpen(false);
                  }}
                  className={`block w-full rounded-md px-3 py-2 text-left ${searchScope === "posts" ? "bg-mist text-ink" : "text-ink/65 hover:bg-mist hover:text-ink"}`}
                >
                  搜索树洞
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchScope("all");
                    setSearchSettingsOpen(false);
                  }}
                  className={`block w-full rounded-md px-3 py-2 text-left ${searchScope === "all" ? "bg-mist text-ink" : "text-ink/65 hover:bg-mist hover:text-ink"}`}
                >
                  搜索树洞和回复
                </button>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={loadPosts}
            disabled={loading}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink/10 bg-panel text-ink/70 hover:bg-mist hover:text-ink disabled:opacity-50"
            aria-label="刷新"
            title="刷新"
          >
            <RotateCcw size={16} aria-hidden="true" />
          </button>
        </form>
        {activeQuery ? (
          <button type="button" onClick={clearSearch} className="rounded-md px-2 py-1 text-xs font-medium text-white/75 hover:bg-white/10 hover:text-white">
            清除搜索：{activeQuery}
          </button>
        ) : null}

        {loading ? <p className="text-sm text-white/75">正在加载...</p> : null}
        {error ? <p className="rounded-md bg-clay/10 p-3 text-sm text-clay">{error}</p> : null}
        {!loading && !error && posts.length === 0 ? (
          <EmptyState title={mode === "favorites" ? "还没有关注" : "还没有内容"} text={mode === "favorites" ? "关注树洞后，它们会出现在这里。" : "发布第一条内容后，它会出现在这里。"} />
        ) : null}

        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              selected={post.id === selectedId}
              onSelect={() => openPost(post.id)}
              onReplySelect={() => openPost(post.id)}
              onFavoriteChanged={loadPosts}
              onDeleted={loadPosts}
            />
          ))}
        </div>
      </section>

      {layout === "split" ? (
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <PostDetailPanel postId={selectedId} onClose={() => setSelectedId(null)} onChanged={loadPosts} />
        </aside>
      ) : null}
    </main>
  );
}
