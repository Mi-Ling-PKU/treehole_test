export type ContentStatus = "active" | "folded" | "deleted";
export type ReportTargetType = "post" | "comment";
export type ReportStatus = "open" | "reviewed" | "dismissed";
export type MessageKind = "system" | "reply" | "moderation" | "ban";

export type Post = {
  id: string;
  public_no: number;
  author_id: string;
  content: string;
  status: ContentStatus;
  tag: string | null;
  reply_count: number;
  favorite_count: number;
  report_count: number;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  post_id: string;
  sequence: number;
  author_id: string;
  reply_to_comment_id: string | null;
  content: string;
  status: ContentStatus;
  tag: string | null;
  report_count: number;
  created_at: string;
  updated_at: string;
};

export type Participant = {
  post_id: string;
  user_id: string;
  display_name: string;
  sequence: number;
  created_at: string;
};

export type Favorite = {
  user_id: string;
  post_id: string;
  created_at: string;
};

export type Message = {
  id: string;
  user_id: string;
  kind: MessageKind;
  title: string;
  content: string;
  post_id: string | null;
  comment_id: string | null;
  read_at: string | null;
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
  updated_at: string;
};

export type PostSummary = Post & {
  is_favorited: boolean;
};

export type CommentView = Comment & {
  author_name: string;
  reply_to_sequence: number | null;
  reply_to_author_name: string | null;
};

export type PostDetail = {
  post: PostSummary;
  participants: Participant[];
  comments: CommentView[];
};

export type AdminReportRow = Report & {
  post: Pick<Post, "id" | "public_no" | "author_id" | "content" | "status" | "created_at"> | null;
  comment: Pick<Comment, "id" | "post_id" | "sequence" | "author_id" | "content" | "status" | "created_at"> | null;
};
