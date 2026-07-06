export type ContentStatus = "active" | "hidden" | "deleted";
export type ReportTargetType = "post" | "comment";
export type ReportStatus = "open" | "reviewed";

export type Post = {
  id: string;
  public_no: number;
  user_id: string;
  content: string;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  public_no: number;
  post_id: string;
  user_id: string;
  content: string;
  reply_to_comment_id: string | null;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
};

export type Favorite = {
  user_id: string;
  post_id: string;
  created_at: string;
};

export type Report = {
  id: string;
  target_type: ReportTargetType;
  target_id: string;
  user_id: string;
  reason: string;
  status: ReportStatus;
  created_at: string;
};

export type PostListItem = Post & {
  comments_count: number;
  is_favorited: boolean;
};

export type CommentWithReply = Comment & {
  reply_to_public_no: number | null;
};

export type AdminReportRow = Report & {
  post: Pick<Post, "id" | "public_no" | "content" | "status" | "user_id" | "created_at"> | null;
  comment: Pick<Comment, "id" | "public_no" | "post_id" | "content" | "status" | "user_id" | "created_at"> | null;
};
