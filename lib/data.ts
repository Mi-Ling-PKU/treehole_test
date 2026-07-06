import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type {
  AdminReportRow,
  Comment,
  CommentWithReply,
  Post,
  PostListItem,
  ReportTargetType
} from "@/lib/types";

type CountRow = {
  post_id: string;
  id: string;
};

export async function getCurrentUser() {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return data.user;
}

export async function isCurrentUserAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return !error && Boolean(data);
}

export async function listPosts(): Promise<PostListItem[]> {
  assertSupabaseConfigured();
  const user = await getCurrentUser();
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  if (!posts?.length) {
    return [];
  }

  const postIds = posts.map((post) => post.id);

  const [{ data: commentRows }, { data: favorites }] = await Promise.all([
    supabase.from("comments").select("id, post_id").in("post_id", postIds).eq("status", "active").returns<CountRow[]>(),
    user
      ? supabase.from("favorites").select("post_id").eq("user_id", user.id).in("post_id", postIds)
      : Promise.resolve({ data: [] })
  ]);

  const countMap = countCommentsByPost(commentRows ?? []);
  const favoriteSet = new Set((favorites ?? []).map((row) => row.post_id));

  return posts.map((post) => ({
    ...post,
    comments_count: countMap.get(post.id) ?? 0,
    is_favorited: favoriteSet.has(post.id)
  }));
}

export async function listFavoritePosts(): Promise<PostListItem[]> {
  assertSupabaseConfigured();
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("posts(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const posts = (data ?? [])
    .map((row) => row.posts as unknown as Post | null)
    .filter((post): post is Post => post !== null && post.status === "active");

  if (!posts.length) {
    return [];
  }

  const postIds = posts.map((post) => post.id);
  const { data: commentRows } = await supabase
    .from("comments")
    .select("id, post_id")
    .in("post_id", postIds)
    .eq("status", "active")
    .returns<CountRow[]>();

  const countMap = countCommentsByPost(commentRows ?? []);

  return posts.map((post) => ({
    ...post,
    comments_count: countMap.get(post.id) ?? 0,
    is_favorited: true
  }));
}

export async function getPost(id: string): Promise<Post | null> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function listComments(postId: string): Promise<CommentWithReply[]> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const comments = (data ?? []) as Comment[];
  const byId = new Map(comments.map((comment) => [comment.id, comment.public_no]));

  return comments.map((comment) => ({
    ...comment,
    reply_to_public_no: comment.reply_to_comment_id
      ? byId.get(comment.reply_to_comment_id) ?? null
      : null
  }));
}

export async function isPostFavorited(postId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("post_id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  return !error && Boolean(data);
}

export async function createPost(content: string) {
  assertSupabaseConfigured();
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("登录后就可以发布。");
  }

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    content
  });

  if (error) {
    throw error;
  }
}

export async function createComment(postId: string, content: string, replyToCommentId?: string | null) {
  assertSupabaseConfigured();
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("登录后就可以回复。");
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    content,
    reply_to_comment_id: replyToCommentId ?? null
  });

  if (error) {
    throw error;
  }

  await toggleFavorite(postId, true);
}

export async function toggleFavorite(postId: string, shouldFavorite: boolean) {
  assertSupabaseConfigured();
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("登录后就可以收藏。");
  }

  if (shouldFavorite) {
    const { error } = await supabase.from("favorites").upsert(
      {
        user_id: user.id,
        post_id: postId
      },
      { onConflict: "user_id,post_id" }
    );
    if (error) {
      throw error;
    }
    return;
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("post_id", postId);

  if (error) {
    throw error;
  }
}

export async function createReport(targetType: ReportTargetType, targetId: string, reason: string) {
  assertSupabaseConfigured();
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("登录后就可以举报。");
  }

  const { error } = await supabase.from("reports").insert({
    target_type: targetType,
    target_id: targetId,
    user_id: user.id,
    reason
  });

  if (error) {
    throw error;
  }
}

export async function listAdminReports(): Promise<AdminReportRow[]> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const reports = data ?? [];
  const postIds = reports.filter((report) => report.target_type === "post").map((report) => report.target_id);
  const commentIds = reports.filter((report) => report.target_type === "comment").map((report) => report.target_id);

  const [{ data: posts }, { data: comments }] = await Promise.all([
    postIds.length
      ? supabase
          .from("posts")
          .select("id, public_no, content, status, user_id, created_at")
          .in("id", postIds)
      : Promise.resolve({ data: [] }),
    commentIds.length
      ? supabase
          .from("comments")
          .select("id, public_no, post_id, content, status, user_id, created_at")
          .in("id", commentIds)
      : Promise.resolve({ data: [] })
  ]);

  const postsById = new Map((posts ?? []).map((post) => [post.id, post]));
  const commentsById = new Map((comments ?? []).map((comment) => [comment.id, comment]));

  return reports.map((report) => ({
    ...report,
    post: report.target_type === "post" ? postsById.get(report.target_id) ?? null : null,
    comment: report.target_type === "comment" ? commentsById.get(report.target_id) ?? null : null
  })) as AdminReportRow[];
}

export async function updateContentStatus(
  targetType: ReportTargetType,
  targetId: string,
  status: "active" | "hidden" | "deleted"
) {
  assertSupabaseConfigured();
  const table = targetType === "post" ? "posts" : "comments";
  const { error } = await supabase.from(table).update({ status }).eq("id", targetId);

  if (error) {
    throw error;
  }
}

export async function markReportReviewed(reportId: string) {
  assertSupabaseConfigured();
  const { error } = await supabase.from("reports").update({ status: "reviewed" }).eq("id", reportId);
  if (error) {
    throw error;
  }
}

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error("请先配置 Supabase 环境变量。复制 .env.example 为 .env.local，并填入项目 URL 和 Anon Key。");
  }
}

function countCommentsByPost(rows: CountRow[]) {
  const countMap = new Map<string, number>();
  for (const row of rows) {
    countMap.set(row.post_id, (countMap.get(row.post_id) ?? 0) + 1);
  }
  return countMap;
}
