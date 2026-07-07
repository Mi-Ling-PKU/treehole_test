"use client";

import { Clock, MessageSquare } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ReportButton } from "@/components/ReportButton";
import type { PostSummary } from "@/lib/types";

const formatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

export function PostCard({
  post,
  selected,
  onSelect,
  onReplySelect,
  onFavoriteChanged
}: {
  post: PostSummary;
  selected?: boolean;
  onSelect: () => void;
  onReplySelect?: () => void;
  onFavoriteChanged?: () => void;
}) {
  return (
    <article className={`rounded-md border bg-panel/85 p-4 shadow-soft ${selected ? "border-moss/55" : "border-ink/10"}`}>
      <button type="button" onClick={onSelect} className="block w-full text-left">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-semibold text-moss">#{post.public_no}</span>
          <span className="inline-flex items-center gap-1 text-xs text-ink/45">
            <Clock size={14} aria-hidden="true" />
            {formatter.format(new Date(post.created_at))}
          </span>
        </div>
        <p className="mt-3 line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-ink">{post.content}</p>
      </button>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-t border-ink/10 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onReplySelect ?? onSelect}
            className="inline-flex items-center gap-1 rounded-md bg-mist px-2 py-1 text-xs font-medium text-ink/65 hover:text-ink"
          >
            <MessageSquare size={14} aria-hidden="true" />
            {post.reply_count} 条回复
          </button>
          {post.status === "folded" ? (
            <span className="rounded-md bg-clay/10 px-2 py-1 text-xs font-medium text-clay">已折叠</span>
          ) : null}
          <div className="flex items-center gap-2">
            <FavoriteButton
              postId={post.id}
              count={post.favorite_count}
              initialFavorited={post.is_favorited}
              onChanged={onFavoriteChanged}
            />
            {post.is_favorited ? <span className="text-xs font-medium text-clay">已关注</span> : null}
          </div>
        </div>
        <ReportButton targetType="post" targetId={post.id} />
      </div>
    </article>
  );
}
