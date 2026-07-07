"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, Clock, MessageSquareReply, X } from "lucide-react";
import { CommentComposer } from "@/components/CommentComposer";
import { CommentList } from "@/components/CommentList";
import { ComposerDrawer } from "@/components/ComposerDrawer";
import { DeleteButton } from "@/components/DeleteButton";
import { EmptyState } from "@/components/EmptyState";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ReportButton } from "@/components/ReportButton";
import { getPostDetail } from "@/lib/data";
import type { CommentView, PostDetail } from "@/lib/types";

const formatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

export function PostDetailPanel({
  postId,
  initialReplyOpen = false,
  onClose,
  onChanged
}: {
  postId: string | null;
  initialReplyOpen?: boolean;
  onClose?: () => void;
  onChanged?: () => void;
}) {
  const [detail, setDetail] = useState<PostDetail | null>(null);
  const [replyingTo, setReplyingTo] = useState<CommentView | null>(null);
  const [replyOpen, setReplyOpen] = useState(initialReplyOpen);
  const [replySort, setReplySort] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    if (!postId) {
      setDetail(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setDetail(await getPostDetail(postId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "暂时加载不了这个树洞，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    setReplyingTo(null);
    setReplyOpen(initialReplyOpen);
    setReplySort("asc");
    loadDetail();
  }, [initialReplyOpen, loadDetail]);

  async function refreshAll() {
    await loadDetail();
    onChanged?.();
  }

  async function handleReplyCreated() {
    setReplyOpen(false);
    setReplyingTo(null);
    await refreshAll();
  }

  async function handlePostDeleted() {
    onClose?.();
    onChanged?.();
  }

  function openPostReply() {
    setReplyingTo(null);
    setReplyOpen(true);
  }

  function openCommentReply(comment: CommentView) {
    setReplyingTo(comment);
    setReplyOpen(true);
  }

  const replyPreview = replyingTo ? (
    <article className="rounded-md border border-ink/10 bg-paper p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-mist px-2 py-1 text-xs font-semibold text-moss">{replyingTo.author_name}</span>
        <span className="rounded-md bg-mist px-2 py-1 text-xs font-semibold text-moss">#{replyingTo.sequence}</span>
      </div>
      <p className="whitespace-pre-wrap text-base leading-7 text-ink">{replyingTo.content}</p>
    </article>
  ) : detail ? (
    <article className="rounded-md border border-ink/10 bg-paper p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-mist px-2 py-1 text-xs font-semibold text-moss">洞主</span>
        <span className="rounded-md bg-mist px-2 py-1 text-xs font-semibold text-moss">#{detail.post.public_no}</span>
      </div>
      <p className="whitespace-pre-wrap text-base leading-7 text-ink">{detail.post.content}</p>
    </article>
  ) : null;

  if (!postId) {
    return (
      <div className="rounded-md border border-dashed border-ink/20 bg-panel/60 p-8 text-center text-sm text-ink/55">
        选择一条树洞查看完整回复。
      </div>
    );
  }

  if (loading) {
    return <div className="rounded-md border border-ink/10 bg-panel/75 p-4 text-sm text-ink/60">正在加载...</div>;
  }

  if (error) {
    return <p className="rounded-md bg-clay/10 p-3 text-sm text-clay">{error}</p>;
  }

  if (!detail) {
    return <EmptyState title="没有找到这个树洞" text="它可能已被删除。" />;
  }

  const sortedComments = [...detail.comments].sort((a, b) =>
    replySort === "asc" ? a.sequence - b.sequence : b.sequence - a.sequence
  );

  return (
    <section className="space-y-5">
      <article className="rounded-md border border-ink/10 bg-panel/75 p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-mist px-2 py-1 text-xs font-semibold text-moss">洞主</span>
            <h1 className="text-lg font-semibold text-moss">#{detail.post.public_no}</h1>
            {detail.post.status === "folded" ? (
              <span className="rounded-md bg-clay/10 px-2 py-1 text-xs font-medium text-clay">已折叠</span>
            ) : null}
          </div>
          <div className="flex items-center gap-2 text-xs text-ink/45">
            <Clock size={14} aria-hidden="true" />
            {formatter.format(new Date(detail.post.created_at))}
            {onClose ? (
              <button type="button" onClick={onClose} className="rounded-md p-1 hover:bg-mist hover:text-ink" title="关闭">
                <X size={14} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
        <button type="button" onClick={openPostReply} className="mt-4 block w-full text-left">
          <p className="whitespace-pre-wrap text-base leading-7 text-ink">{detail.post.content}</p>
        </button>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-t border-ink/10 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openPostReply}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ink/55 hover:bg-mist hover:text-ink"
            >
              <MessageSquareReply size={14} aria-hidden="true" />
              回复
            </button>
            <FavoriteButton
              postId={detail.post.id}
              count={detail.post.favorite_count}
              initialFavorited={detail.post.is_favorited}
              onChanged={refreshAll}
            />
            {detail.post.is_favorited ? <span className="text-xs font-medium text-clay">已关注</span> : null}
          </div>
          <div className="flex items-start gap-2">
            <DeleteButton
              targetType="post"
              targetId={detail.post.id}
              authorId={detail.post.author_id}
              onDeleted={handlePostDeleted}
            />
            <ReportButton targetType="post" targetId={detail.post.id} />
          </div>
        </div>
      </article>

      {replyOpen && replyPreview ? (
        <ComposerDrawer
          title="写回复"
          preview={replyPreview}
          onClose={() => {
            setReplyOpen(false);
            setReplyingTo(null);
          }}
        >
          <CommentComposer
            postId={detail.post.id}
            replyingTo={replyingTo}
            onCancelReply={() => {
              setReplyOpen(false);
              setReplyingTo(null);
            }}
            onCreated={handleReplyCreated}
            surface="plain"
            draftKey={`treehole:draft:reply:${detail.post.id}:${replyingTo?.id ?? "post"}`}
          />
        </ComposerDrawer>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-ink">回复 {detail.comments.length}</h2>
          <button
            type="button"
            onClick={() => setReplySort((value) => (value === "asc" ? "desc" : "asc"))}
            className="inline-flex items-center gap-1 rounded-md border border-ink/10 px-2 py-1 text-xs font-semibold text-ink/70 hover:bg-mist"
          >
            {replySort === "asc" ? <ArrowDownAZ size={14} aria-hidden="true" /> : <ArrowUpAZ size={14} aria-hidden="true" />}
            {replySort === "asc" ? "顺序" : "逆序"}
          </button>
        </div>
        {detail.comments.length === 0 ? <EmptyState title="还没有回复" text="你可以留下第一条回应。" /> : null}
        <CommentList comments={sortedComments} onReply={openCommentReply} onDeleted={refreshAll} />
      </section>
    </section>
  );
}
