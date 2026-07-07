"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { LogOut, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function AuthGate({
  children,
  barMaxWidthClassName = "max-w-6xl"
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
  barMaxWidthClassName?: string;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return <div className="rounded-md border border-ink/10 bg-panel/75 p-4 text-sm text-ink/60">正在连接社区...</div>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-md px-4 py-10 sm:px-6">
        <section className="rounded-md border border-ink/10 bg-panel/90 p-6 shadow-soft">
          <h1 className="text-xl font-semibold text-ink">登录后进入树洞</h1>
          <p className="mt-2 text-sm leading-6 text-ink/60">这里需要账号才能浏览和参与，公开页面不会显示你的邮箱。</p>
          <Link
            href="/login"
            className="mt-5 inline-flex rounded-md bg-moss px-4 py-2 text-sm font-semibold text-white hover:bg-moss/90"
          >
            登录或注册
          </Link>
        </section>
      </main>
    );
  }

  return (
    <>
      <div className={`mx-auto ${barMaxWidthClassName} px-4 pt-4 sm:px-6`}>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-ink/10 bg-panel/80 px-4 py-3 text-sm shadow-soft">
          <div className="flex min-w-0 items-center gap-2 text-ink/70">
            <UserRound size={17} aria-hidden="true" />
            <span className="truncate">{user.email}</span>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-md border border-ink/10 px-3 py-2 font-medium text-ink/70 hover:bg-mist hover:text-ink"
          >
            <LogOut size={16} aria-hidden="true" />
            退出
          </button>
        </div>
      </div>
      {children}
    </>
  );
}
