"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, MailOpen } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { EmptyState } from "@/components/EmptyState";
import { listMessages, markMessageRead } from "@/lib/data";
import type { Message } from "@/lib/types";

const formatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadMessages() {
    setLoading(true);
    setError(null);

    try {
      setMessages(await listMessages());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "暂时加载不了消息，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  async function markRead(messageId: string) {
    try {
      await markMessageRead(messageId);
      await loadMessages();
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : "暂时无法标记已读。");
    }
  }

  return (
    <AuthGate>
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Link href="/" className="mb-4 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-ink/60 hover:bg-mist hover:text-ink">
          <ArrowLeft size={16} aria-hidden="true" />
          返回广场
        </Link>

        <div className="mb-5">
          <h1 className="text-2xl font-semibold text-ink">消息</h1>
          <p className="mt-2 text-sm text-ink/60">回复提醒和站点通知会出现在这里。</p>
        </div>

        {loading ? <p className="text-sm text-ink/55">正在加载...</p> : null}
        {error ? <p className="mb-4 rounded-md bg-clay/10 p-3 text-sm text-clay">{error}</p> : null}
        {!loading && !error && messages.length === 0 ? <EmptyState title="还没有消息" text="有新的回复或通知时会显示在这里。" /> : null}

        <div className="space-y-3">
          {messages.map((message) => (
            <article key={message.id} className="rounded-md border border-ink/10 bg-panel/90 p-4 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MailOpen size={16} className={message.read_at ? "text-ink/35" : "text-moss"} aria-hidden="true" />
                  <h2 className="text-sm font-semibold text-ink">{message.title}</h2>
                  {!message.read_at ? <span className="rounded-md bg-clay/10 px-2 py-1 text-xs font-medium text-clay">未读</span> : null}
                </div>
                <span className="text-xs text-ink/45">{formatter.format(new Date(message.created_at))}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink/70">{message.content}</p>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-ink/10 pt-3">
                {message.post_id ? (
                  <Link href={`/post/${message.post_id}`} className="rounded-md bg-moss px-3 py-2 text-xs font-semibold text-white hover:bg-moss/90">
                    查看树洞
                  </Link>
                ) : null}
                {!message.read_at ? (
                  <button
                    type="button"
                    onClick={() => markRead(message.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-ink/10 px-3 py-2 text-xs font-semibold text-ink/70 hover:bg-mist"
                  >
                    <Check size={14} aria-hidden="true" />
                    标记已读
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </main>
    </AuthGate>
  );
}
