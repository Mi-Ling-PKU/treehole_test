import Link from "next/link";
import { MessageSquare, Clock } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ReportButton } from "@/components/ReportButton";
import type { PostListItem } from "@/lib/types";

const formatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

export function PostCard({ post, onFavoriteChanged }: { post: PostListItem; onFavoriteChanged?: () => void }) {
  return (
    <article className="rounded-md border border-ink/10 bg-panel/85 p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/post/${post.id}`} className="text-sm font-semibold text-moss hover:text-moss/80">
          #{post.public_no}
        </Link>
        <span className="inline-flex items-center gap-1 text-xs text-ink/45">
          <Clock size={14} aria-hidden="true" />
          {formatter.format(new Date(post.created_at))}
        </span>
      </div>
      <Link href={`/post/${post.id}`} className="mt-3 block whitespace-pre-wrap text-sm leading-6 text-ink">
        {post.content}
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-t border-ink/10 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-mist px-2 py-1 text-xs font-medium text-ink/65">
            <MessageSquare size={14} aria-hidden="true" />
            {post.comments_count} 条回复
          </span>
          <FavoriteButton postId={post.id} initialFavorited={post.is_favorited} onChanged={onFavoriteChanged} />
        </div>
        <ReportButton targetType="post" targetId={post.id} />
      </div>
    </article>
  );
}
