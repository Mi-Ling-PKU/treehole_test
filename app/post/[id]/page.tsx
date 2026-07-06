"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { CommentComposer } from "@/components/CommentComposer";
import { CommentList } from "@/components/CommentList";
import { EmptyState } from "@/components/EmptyState";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ReportButton } from "@/components/ReportButton";
import { getPost, isPostFavorited, listComments } from "@/lib/data";
import type { CommentWithReply, Post } from "@/lib/types";

const formatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentWithReply[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [replyingTo, setReplyingTo] = useState<CommentWithReply | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [postData, commentsData, favorited] = await Promise.all([
        getPost(params.id),
        listComments(params.id),
        isPostFavorited(params.id)
      ]);
      setPost(postData);
      setComments(commentsData);
      setIsFavorited(favorited);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "加载失败。");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <Link href="/" className="mb-4 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-ink/60 hover:bg-mist hover:text-ink">
        <ArrowLeft size={16} aria-hidden="true" />
        返回首页
      </Link>

      {loading ? <p className="text-sm text-ink/55">正在加载...</p> : null}
      {error ? <p className="rounded-md bg-clay/10 p-3 text-sm text-clay">{error}</p> : null}

      {!loading && !error && !post ? <EmptyState title="没有找到这个树洞" text="它可能已被隐藏或删除。" /> : null}

      {post ? (
        <div className="space-y-5">
          <article className="rounded-md border border-ink/10 bg-panel/90 p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-mist px-2 py-1 text-xs font-semibold text-moss">OP</span>
                <h1 className="text-lg font-semibold text-moss">#{post.public_no}</h1>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-ink/45">
                <Clock size={14} aria-hidden="true" />
                {formatter.format(new Date(post.created_at))}
              </span>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-ink">{post.content}</p>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-t border-ink/10 pt-3">
              <FavoriteButton postId={post.id} initialFavorited={isFavorited} onChanged={loadDetail} />
              <ReportButton targetType="post" targetId={post.id} />
            </div>
          </article>

          <AuthGate>
            <CommentComposer
              postId={post.id}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              onCreated={loadDetail}
            />
          </AuthGate>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-ink">回复 {comments.length}</h2>
            {comments.length === 0 ? <EmptyState title="还没有回复" text="登录后可以留下第一条回应。" /> : null}
            <CommentList comments={comments} postAuthorId={post.user_id} onReply={setReplyingTo} />
          </section>
        </div>
      ) : null}
    </main>
  );
}
