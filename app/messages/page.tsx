"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Mail, MailOpen } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { EmptyState } from "@/components/EmptyState";
import { listMessages, markAllMessagesRead, markMessageRead, markMessageUnread } from "@/lib/data";
import type { Message } from "@/lib/types";

const formatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

export default function MessagesPage() {
  const router = useRouter();
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

    const intervalId = window.setInterval(loadMessages, 15000);

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") {
        loadMessages();
      }
    }

    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  async function markRead(messageId: string) {
    try {
      await markMessageRead(messageId);
      await loadMessages();
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : "暂时无法标记已读。");
    }
  }

  async function markUnread(messageId: string) {
    try {
      await markMessageUnread(messageId);
      await loadMessages();
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : "暂时无法设为未读。");
    }
  }

  async function markAllRead() {
    try {
      await markAllMessagesRead();
      await loadMessages();
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : "暂时无法全部标记已读。");
    }
  }

  async function openMessage(message: Message) {
    if (!message.post_id) {
      return;
    }

    try {
      if (!message.read_at) {
        await markMessageRead(message.id);
      }
      router.push(`/post/${message.post_id}`);
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : "暂时无法打开这条树洞。");
    }
  }

  return (
    <AuthGate barMaxWidthClassName="max-w-3xl">
      <main className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
        <Link href="/" className="mb-4 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-ink/60 hover:bg-mist hover:text-ink">
          <ArrowLeft size={16} aria-hidden="true" />
          返回广场
        </Link>

        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-ink">消息</h1>
            <p className="mt-2 text-sm text-ink/60">回复提醒和站点通知会出现在这里。</p>
          </div>
          <button
            type="button"
            onClick={markAllRead}
            className="rounded-md border border-ink/10 bg-panel px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-mist hover:text-ink"
          >
            全部已读
          </button>
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
                  <button
                    type="button"
                    onClick={() => openMessage(message)}
                    className="rounded-md bg-moss px-3 py-2 text-xs font-semibold text-white hover:bg-moss/90"
                  >
                    查看树洞
                  </button>
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
                ) : (
                  <button
                    type="button"
                    onClick={() => markUnread(message.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-ink/10 px-3 py-2 text-xs font-semibold text-ink/70 hover:bg-mist"
                  >
                    <Mail size={14} aria-hidden="true" />
                    设为未读
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>
    </AuthGate>
  );
}
