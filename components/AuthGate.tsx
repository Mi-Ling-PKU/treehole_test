"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { LogOut, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

type AuthGateProps = {
  children?: React.ReactNode;
  requireAuth?: boolean;
};

export function AuthGate({ children, requireAuth = false }: AuthGateProps) {
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
    return <div className="rounded-md border border-ink/10 bg-panel/70 p-4 text-sm text-ink/60">正在确认登录状态...</div>;
  }

  if (!user && requireAuth) {
    return (
      <div className="rounded-md border border-ink/10 bg-panel/80 p-5 shadow-soft">
        <p className="text-sm text-ink/70">登录后就可以发布、回复、收藏和举报。</p>
        <Link
          href="/login"
          className="mt-4 inline-flex rounded-md bg-moss px-4 py-2 text-sm font-semibold text-white hover:bg-moss/90"
        >
          去登录
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-ink/10 bg-panel/80 px-4 py-3 text-sm shadow-soft">
        {user ? (
          <>
            <div className="flex min-w-0 items-center gap-2 text-ink/70">
              <UserRound size={17} aria-hidden="true" />
              <span className="truncate">已登录：{user.email}</span>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-md border border-ink/10 px-3 py-2 font-medium text-ink/70 hover:bg-mist hover:text-ink"
            >
              <LogOut size={16} aria-hidden="true" />
              退出
            </button>
          </>
        ) : (
          <>
            <span className="text-ink/70">你可以先浏览，登录后再参与互动。</span>
            <Link href="/login" className="rounded-md bg-moss px-3 py-2 font-semibold text-white hover:bg-moss/90">
              登录
            </Link>
          </>
        )}
      </div>
      {children}
    </>
  );
}
