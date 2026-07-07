"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, RotateCcw, ShieldAlert, Trash2 } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { EmptyState } from "@/components/EmptyState";
import { isCurrentUserAdmin, listAdminReports, moderateContent, reviewReport } from "@/lib/data";
import type { AdminReportRow, ReportTargetType } from "@/lib/types";

const formatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState<AdminReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function loadAdmin() {
    setLoading(true);
    setMessage(null);

    try {
      const allowed = await isCurrentUserAdmin();
      setIsAdmin(allowed);
      setReports(allowed ? await listAdminReports() : []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "暂时无法加载审核内容，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmin();
  }, []);

  async function handleModeration(targetType: ReportTargetType, targetId: string, action: "fold" | "delete" | "restore", banUser = false) {
    setMessage(null);
    try {
      await moderateContent({
        targetType,
        targetId,
        action,
        banUser,
        reason: banUser ? "内容违反社区规则，账号已被暂时限制。" : "内容已由站点管理者处理。"
      });
      await loadAdmin();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作没有成功，请稍后再试。");
    }
  }

  async function markReport(reportId: string, status: "reviewed" | "dismissed") {
    setMessage(null);
    try {
      await reviewReport(reportId, status);
      await loadAdmin();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作没有成功，请稍后再试。");
    }
  }

  return (
    <AuthGate>
      <main className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <Link href="/" className="mb-4 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-ink/60 hover:bg-mist hover:text-ink">
          <ArrowLeft size={16} aria-hidden="true" />
          返回广场
        </Link>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-ink">内容审核</h1>
            <p className="mt-2 text-sm text-ink/60">处理举报、折叠内容、删除内容或暂时限制违规账号。</p>
          </div>
          {isAdmin ? (
            <button
              type="button"
              onClick={loadAdmin}
              className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-panel px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-mist"
            >
              <RotateCcw size={16} aria-hidden="true" />
              刷新
            </button>
          ) : null}
        </div>

        {loading ? <p className="text-sm text-ink/55">正在加载...</p> : null}
        {message ? <p className="mb-4 rounded-md bg-clay/10 p-3 text-sm text-clay">{message}</p> : null}

        {!loading && !isAdmin ? (
          <div className="rounded-md border border-ink/10 bg-panel/90 p-5 shadow-soft">
            <div className="flex items-center gap-2 font-semibold text-ink">
              <ShieldAlert size={18} aria-hidden="true" />
              你目前不能访问这个页面
            </div>
            <p className="mt-2 text-sm leading-6 text-ink/60">这个页面只对站点管理员开放。你仍然可以返回广场浏览和发布内容。</p>
          </div>
        ) : null}

        {!loading && isAdmin && reports.length === 0 ? <EmptyState title="暂无举报" text="用户提交举报后会出现在这里。" /> : null}

        <div className="space-y-4">
          {reports.map((report) => {
            const content = report.target_type === "post" ? report.post : report.comment;
            const contentLabel =
              report.target_type === "post" && report.post
                ? `#${report.post.public_no}`
                : report.target_type === "comment" && report.comment
                  ? `#${report.comment.sequence}`
                  : "";

            return (
              <article key={report.id} className="rounded-md border border-ink/10 bg-panel/90 p-4 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-mist px-2 py-1 text-xs font-semibold text-moss">
                      {report.target_type === "post" ? "树洞" : "回复"}
                    </span>
                    <span className="rounded-md bg-clay/10 px-2 py-1 text-xs font-semibold text-clay">
                      {report.status === "open" ? "待处理" : report.status === "reviewed" ? "已处理" : "已忽略"}
                    </span>
                    <span className="text-xs text-ink/45">{formatter.format(new Date(report.created_at))}</span>
                  </div>
                </div>

                <div className="mt-3 rounded-md bg-paper p-3">
                  <p className="text-xs font-semibold text-ink/50">举报原因</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink">{report.reason}</p>
                </div>

                <div className="mt-3 rounded-md border border-ink/10 p-3">
                  {content ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-ink/50">
                        <span>{contentLabel}</span>
                        <span>状态：{content.status}</span>
                        <span className="break-all">作者 ID：{content.author_id}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{content.content}</p>
                    </>
                  ) : (
                    <p className="text-sm text-ink/55">目标内容不存在或已删除。</p>
                  )}
                </div>

                {content ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleModeration(report.target_type, content.id, "fold")}
                      className="inline-flex items-center gap-2 rounded-md bg-moss px-3 py-2 text-sm font-semibold text-white hover:bg-moss/90"
                    >
                      <EyeOff size={16} aria-hidden="true" />
                      折叠
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeration(report.target_type, content.id, "restore")}
                      className="inline-flex items-center gap-2 rounded-md border border-ink/10 px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-mist"
                    >
                      <Eye size={16} aria-hidden="true" />
                      恢复
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeration(report.target_type, content.id, "delete")}
                      className="inline-flex items-center gap-2 rounded-md bg-clay px-3 py-2 text-sm font-semibold text-white hover:bg-clay/90"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      删除
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeration(report.target_type, content.id, "delete", true)}
                      className="inline-flex items-center gap-2 rounded-md bg-clay px-3 py-2 text-sm font-semibold text-white hover:bg-clay/90"
                    >
                      <ShieldAlert size={16} aria-hidden="true" />
                      删除并限制 7 天
                    </button>
                    <button
                      type="button"
                      onClick={() => markReport(report.id, "reviewed")}
                      className="inline-flex items-center gap-2 rounded-md border border-ink/10 px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-mist"
                    >
                      <CheckCircle2 size={16} aria-hidden="true" />
                      标记已处理
                    </button>
                    <button
                      type="button"
                      onClick={() => markReport(report.id, "dismissed")}
                      className="rounded-md border border-ink/10 px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-mist"
                    >
                      忽略
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </main>
    </AuthGate>
  );
}
