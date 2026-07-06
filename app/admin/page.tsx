"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, RotateCcw, ShieldAlert, Trash2, EyeOff, CheckCircle2 } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { EmptyState } from "@/components/EmptyState";
import { isCurrentUserAdmin, listAdminReports, markReportReviewed, updateContentStatus } from "@/lib/data";
import type { AdminReportRow, ContentStatus, ReportTargetType } from "@/lib/types";

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
      setMessage(error instanceof Error ? error.message : "加载失败。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmin();
  }, []);

  async function setContentStatus(targetType: ReportTargetType, targetId: string, status: ContentStatus) {
    setMessage(null);
    try {
      await updateContentStatus(targetType, targetId, status);
      await loadAdmin();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败。");
    }
  }

  async function reviewReport(reportId: string) {
    setMessage(null);
    try {
      await markReportReviewed(reportId);
      await loadAdmin();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败。");
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <Link href="/" className="mb-4 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-ink/60 hover:bg-mist hover:text-ink">
        <ArrowLeft size={16} aria-hidden="true" />
        返回首页
      </Link>

      <AuthGate requireAuth>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-ink">管理后台</h1>
            <p className="mt-2 text-sm text-ink/60">处理举报、隐藏、恢复或删除帖子和回复。</p>
          </div>
          <button
            type="button"
            onClick={loadAdmin}
            className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-panel px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-mist"
          >
            <RotateCcw size={16} aria-hidden="true" />
            刷新
          </button>
        </div>

        {loading ? <p className="text-sm text-ink/55">正在加载...</p> : null}
        {message ? <p className="mb-4 rounded-md bg-clay/10 p-3 text-sm text-clay">{message}</p> : null}

        {!loading && !isAdmin ? (
          <div className="rounded-md border border-ink/10 bg-panel/85 p-5 shadow-soft">
            <div className="flex items-center gap-2 font-semibold text-ink">
              <ShieldAlert size={18} aria-hidden="true" />
              当前账号不是管理员
            </div>
            <p className="mt-2 text-sm leading-6 text-ink/60">请先在 Supabase 的 `admins` 表中添加你的用户 ID。</p>
          </div>
        ) : null}

        {!loading && isAdmin && reports.length === 0 ? (
          <EmptyState title="暂无举报" text="用户提交举报后会出现在这里。" />
        ) : null}

        <div className="space-y-4">
          {reports.map((report) => {
            const content = report.target_type === "post" ? report.post : report.comment;
            return (
              <article key={report.id} className="rounded-md border border-ink/10 bg-panel/90 p-4 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-mist px-2 py-1 text-xs font-semibold text-moss">
                      {report.target_type === "post" ? "帖子" : "回复"}
                    </span>
                    <span className="rounded-md bg-clay/10 px-2 py-1 text-xs font-semibold text-clay">
                      {report.status === "open" ? "待处理" : "已处理"}
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
                        <span>{report.target_type === "post" ? `#${content.public_no}` : `#R${content.public_no}`}</span>
                        <span>状态：{content.status}</span>
                        <span className="break-all">用户 ID：{content.user_id}</span>
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
                      onClick={() => setContentStatus(report.target_type, content.id, "hidden")}
                      className="inline-flex items-center gap-2 rounded-md bg-moss px-3 py-2 text-sm font-semibold text-white hover:bg-moss/90"
                    >
                      <EyeOff size={16} aria-hidden="true" />
                      隐藏
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentStatus(report.target_type, content.id, "active")}
                      className="inline-flex items-center gap-2 rounded-md border border-ink/10 px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-mist"
                    >
                      <RotateCcw size={16} aria-hidden="true" />
                      恢复
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentStatus(report.target_type, content.id, "deleted")}
                      className="inline-flex items-center gap-2 rounded-md bg-clay px-3 py-2 text-sm font-semibold text-white hover:bg-clay/90"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      删除
                    </button>
                    <button
                      type="button"
                      onClick={() => reviewReport(report.id)}
                      className="inline-flex items-center gap-2 rounded-md border border-ink/10 px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-mist"
                    >
                      <CheckCircle2 size={16} aria-hidden="true" />
                      标记已处理
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </AuthGate>
    </main>
  );
}
