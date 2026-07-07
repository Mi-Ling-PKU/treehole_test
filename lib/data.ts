import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { getFriendlyDataMessage } from "@/lib/userMessages";
import type {
  AdminReportRow,
  Comment,
  CommentView,
  Favorite,
  Message,
  Participant,
  Post,
  PostDetail,
  PostSummary,
  Report,
  ReportTargetType
} from "@/lib/types";

const POST_PAGE_SIZE = 40;
export type SearchScope = "posts" | "all";

export async function getCurrentUser() {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return data.user;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("AUTH_REQUIRED");
  }
  return user;
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

export async function listPosts(mode: "all" | "favorites" | "search", query = "", searchScope: SearchScope = "all"): Promise<PostSummary[]> {
  assertSupabaseConfigured();
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  if (mode === "favorites") {
    return listFavoritePosts(user.id);
  }

  if (mode === "search" && query.trim()) {
    return searchPosts(query.trim(), user.id, searchScope);
  }

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .neq("status", "deleted")
    .order("created_at", { ascending: false })
    .limit(POST_PAGE_SIZE);

  if (error) {
    throw new Error(getFriendlyDataMessage(error));
  }

  return withFavoriteState((data ?? []) as Post[], user.id);
}

async function listFavoritePosts(userId: string): Promise<PostSummary[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("post_id, created_at, posts(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(POST_PAGE_SIZE);

  if (error) {
    throw new Error(getFriendlyDataMessage(error));
  }

  return (data ?? [])
    .map((row) => row.posts as unknown as Post | null)
    .filter((post): post is Post => post !== null && post.status !== "deleted")
    .map((post) => ({ ...post, is_favorited: true }));
}

async function searchPosts(query: string, userId: string, searchScope: SearchScope): Promise<PostSummary[]> {
  const { data: postMatches, error: postError } = await supabase
    .from("posts")
    .select("*")
    .neq("status", "deleted")
    .ilike("content", `%${query}%`)
    .limit(POST_PAGE_SIZE);

  if (postError) {
    throw new Error(getFriendlyDataMessage(postError));
  }

  const directPosts = (postMatches ?? []) as Post[];

  if (searchScope === "posts") {
    return withFavoriteState(directPosts, userId);
  }

  const { data: commentMatches, error: commentError } = await supabase
    .from("comments")
    .select("post_id")
    .neq("status", "deleted")
    .ilike("content", `%${query}%`)
    .limit(POST_PAGE_SIZE);

  if (commentError) {
    throw new Error(getFriendlyDataMessage(commentError));
  }

  const directIds = new Set(directPosts.map((post) => post.id));
  const commentPostIds = Array.from(new Set((commentMatches ?? []).map((row) => row.post_id))).filter(
    (id) => !directIds.has(id)
  );

  let commentPosts: Post[] = [];
  if (commentPostIds.length) {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .in("id", commentPostIds)
      .neq("status", "deleted");

    if (error) {
      throw new Error(getFriendlyDataMessage(error));
    }
    commentPosts = (data ?? []) as Post[];
  }

  const posts = [...directPosts, ...commentPosts]
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .slice(0, POST_PAGE_SIZE);

  return withFavoriteState(posts, userId);
}

async function withFavoriteState(posts: Post[], userId: string): Promise<PostSummary[]> {
  if (!posts.length) {
    return [];
  }

  const { data } = await supabase
    .from("favorites")
    .select("post_id")
    .eq("user_id", userId)
    .in(
      "post_id",
      posts.map((post) => post.id)
    );

  const favoriteIds = new Set(((data ?? []) as Pick<Favorite, "post_id">[]).map((favorite) => favorite.post_id));
  return posts.map((post) => ({ ...post, is_favorited: favoriteIds.has(post.id) }));
}

export async function getPostDetail(postIdOrPublicNo: string): Promise<PostDetail | null> {
  assertSupabaseConfigured();
  const user = await requireCurrentUser();
  const postQuery = supabase.from("posts").select("*").neq("status", "deleted");
  const postMatcher = isUuid(postIdOrPublicNo)
    ? postQuery.eq("id", postIdOrPublicNo)
    : postQuery.eq("public_no", Number(postIdOrPublicNo));

  if (!isUuid(postIdOrPublicNo) && !Number.isSafeInteger(Number(postIdOrPublicNo))) {
    return null;
  }

  const { data: post, error: postError } = await postMatcher.maybeSingle();

  if (postError) {
    throw new Error(getFriendlyDataMessage(postError));
  }

  if (!post) {
    return null;
  }

  const postId = (post as Post).id;

  const [{ data: comments, error: commentsError }, { data: participants }] = await Promise.all([
    supabase.from("comments").select("*").eq("post_id", postId).neq("status", "deleted").order("sequence"),
    supabase.from("post_participants").select("*").eq("post_id", postId).order("sequence")
  ]);

  if (commentsError) {
    throw new Error(getFriendlyDataMessage(commentsError));
  }

  const [postSummary] = await withFavoriteState([post as Post], user.id);
  const participantRows = (participants ?? []) as Participant[];
  const nameByUser = new Map(participantRows.map((participant) => [participant.user_id, participant.display_name]));
  const commentsById = new Map(((comments ?? []) as Comment[]).map((comment) => [comment.id, comment]));

  const commentViews: CommentView[] = ((comments ?? []) as Comment[]).map((comment) => {
    const replied = comment.reply_to_comment_id ? commentsById.get(comment.reply_to_comment_id) : null;
    return {
      ...comment,
      author_name: nameByUser.get(comment.author_id) ?? "Unknown",
      reply_to_sequence: replied?.sequence ?? null,
      reply_to_author_name: replied ? nameByUser.get(replied.author_id) ?? null : null
    };
  });

  return {
    post: postSummary,
    participants: participantRows,
    comments: commentViews
  };
}

export async function createPost(content: string) {
  assertSupabaseConfigured();
  const { error } = await supabase.rpc("create_post", { p_content: content });
  if (error) {
    throw new Error(getFriendlyDataMessage(error));
  }
}

export async function createComment(postId: string, content: string, replyToCommentId?: string | null) {
  assertSupabaseConfigured();
  const { error } = await supabase.rpc("create_comment", {
    p_post_id: postId,
    p_content: content,
    p_reply_to_comment_id: replyToCommentId ?? null
  });
  if (error) {
    throw new Error(getFriendlyDataMessage(error));
  }
}

export async function setFavorite(postId: string, favorite: boolean) {
  assertSupabaseConfigured();
  const { error } = await supabase.rpc("set_favorite", {
    p_post_id: postId,
    p_favorite: favorite
  });
  if (error) {
    throw new Error(getFriendlyDataMessage(error));
  }
}

export async function createReport(targetType: ReportTargetType, targetId: string, reason: string) {
  assertSupabaseConfigured();
  const { error } = await supabase.rpc("create_report", {
    p_target_type: targetType,
    p_target_id: targetId,
    p_reason: reason
  });
  if (error) {
    throw new Error(getFriendlyDataMessage(error));
  }
}

export async function deleteOwnContent(targetType: ReportTargetType, targetId: string) {
  assertSupabaseConfigured();
  const { error } = await supabase.rpc("delete_own_content", {
    p_target_type: targetType,
    p_target_id: targetId
  });
  if (error) {
    throw new Error(getFriendlyDataMessage(error));
  }
}

export async function listMessages(): Promise<Message[]> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) {
    throw new Error(getFriendlyDataMessage(error));
  }

  return (data ?? []) as Message[];
}

export async function markMessageRead(messageId: string) {
  const { error } = await supabase.rpc("mark_message_read", { p_message_id: messageId });
  if (error) {
    throw new Error(getFriendlyDataMessage(error));
  }
}

export async function markAllMessagesRead() {
  const { error } = await supabase.rpc("mark_all_messages_read");
  if (error) {
    throw new Error(getFriendlyDataMessage(error));
  }
}

export async function markMessageUnread(messageId: string) {
  const { error } = await supabase.rpc("mark_message_unread", { p_message_id: messageId });
  if (error) {
    throw new Error(getFriendlyDataMessage(error));
  }
}

export async function listAdminReports(): Promise<AdminReportRow[]> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(getFriendlyDataMessage(error));
  }

  const reports = (data ?? []) as Report[];
  const postIds = reports.filter((report) => report.target_type === "post").map((report) => report.target_id);
  const commentIds = reports.filter((report) => report.target_type === "comment").map((report) => report.target_id);

  const [{ data: posts }, { data: comments }] = await Promise.all([
    postIds.length
      ? supabase.from("posts").select("id, public_no, author_id, content, status, created_at").in("id", postIds)
      : Promise.resolve({ data: [] }),
    commentIds.length
      ? supabase
          .from("comments")
          .select("id, post_id, sequence, author_id, content, status, created_at")
          .in("id", commentIds)
      : Promise.resolve({ data: [] })
  ]);

  const postsById = new Map(
    ((posts ?? []) as AdminReportRow["post"][]).filter((post): post is NonNullable<AdminReportRow["post"]> => post !== null).map((post) => [post.id, post])
  );
  const commentsById = new Map(
    ((comments ?? []) as AdminReportRow["comment"][])
      .filter((comment): comment is NonNullable<AdminReportRow["comment"]> => comment !== null)
      .map((comment) => [comment.id, comment])
  );

  return reports.map((report) => ({
    ...report,
    post: report.target_type === "post" ? postsById.get(report.target_id) ?? null : null,
    comment: report.target_type === "comment" ? commentsById.get(report.target_id) ?? null : null
  }));
}

export async function reviewReport(reportId: string, status: "open" | "reviewed" | "dismissed") {
  const { error } = await supabase.rpc("review_report", {
    p_report_id: reportId,
    p_status: status
  });
  if (error) {
    throw new Error(getFriendlyDataMessage(error));
  }
}

export async function moderateContent({
  targetType,
  targetId,
  action,
  reason,
  banUser
}: {
  targetType: ReportTargetType;
  targetId: string;
  action: "fold" | "delete" | "restore";
  reason?: string;
  banUser?: boolean;
}) {
  const { error } = await supabase.rpc("moderate_content", {
    p_target_type: targetType,
    p_target_id: targetId,
    p_action: action,
    p_reason: reason ?? null,
    p_ban_user: banUser ?? false,
    p_ban_until: banUser ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null
  });

  if (error) {
    throw new Error(getFriendlyDataMessage(error));
  }
}

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error("请先配置 Supabase 环境变量。");
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
