"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          throw error;
        }
        setStatus("注册邮件已发送。请打开邮箱完成验证后再登录。");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
        router.push("/");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "操作失败。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8 sm:px-6">
      <Link href="/" className="mb-4 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-ink/60 hover:bg-mist hover:text-ink">
        <ArrowLeft size={16} aria-hidden="true" />
        返回首页
      </Link>

      <section className="rounded-md border border-ink/10 bg-panel/90 p-6 shadow-soft">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-ink">{mode === "login" ? "登录" : "注册"}</h1>
          <p className="mt-2 text-sm leading-6 text-ink/60">账号只用于保存收藏和管理权限，公开页面不会显示邮箱。</p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-md bg-mist p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${mode === "login" ? "bg-panel text-ink shadow-sm" : "text-ink/60"}`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${mode === "signup" ? "bg-panel text-ink shadow-sm" : "text-ink/60"}`}
          >
            注册
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-ink">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="focus-ring mt-2 w-full rounded-md border border-ink/15 bg-paper px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-ink">
              密码
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="focus-ring mt-2 w-full rounded-md border border-ink/15 bg-paper px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-moss px-4 py-2 text-sm font-semibold text-white hover:bg-moss/90 disabled:opacity-50"
          >
            {mode === "login" ? <LogIn size={16} aria-hidden="true" /> : <UserPlus size={16} aria-hidden="true" />}
            {mode === "login" ? "登录" : "注册"}
          </button>
        </form>

        {status ? <p className="mt-4 rounded-md bg-mist p-3 text-sm text-ink/65">{status}</p> : null}
      </section>
    </main>
  );
}
