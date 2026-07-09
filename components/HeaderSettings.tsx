"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Check, LogOut, Moon, Settings, Sun, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Theme = "dark" | "light";
type Accent = "green" | "blue" | "amber" | "rose" | "slate";

const accentOptions: Array<{ value: Accent; label: string; swatch: string }> = [
  { value: "green", label: "绿色", swatch: "bg-[#5d7461]" },
  { value: "blue", label: "蓝色", swatch: "bg-[#4f6f91]" },
  { value: "amber", label: "琥珀", swatch: "bg-[#a76f2b]" },
  { value: "rose", label: "玫红", swatch: "bg-[#a95670]" },
  { value: "slate", label: "石墨", swatch: "bg-[#64707d]" }
];

export function HeaderSettings() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<Theme>("dark");
  const [accent, setAccent] = useState<Accent>("green");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme") === "light" ? "light" : "dark";
    const savedAccent = readAccent(window.localStorage.getItem("accent"));
    applyTheme(savedTheme);
    applyAccent(savedAccent);
    setTheme(savedTheme);
    setAccent(savedAccent);

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function closeWhenOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", closeWhenOutside);
    }

    return () => document.removeEventListener("mousedown", closeWhenOutside);
  }, [open]);

  async function signOut() {
    await supabase.auth.signOut();
    setOpen(false);
  }

  function chooseTheme(nextTheme: Theme) {
    applyTheme(nextTheme);
    setTheme(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
  }

  function chooseAccent(nextAccent: Accent) {
    applyAccent(nextAccent);
    setAccent(nextAccent);
    window.localStorage.setItem("accent", nextAccent);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink/70 hover:bg-mist hover:text-ink dark:border-white/15 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
        aria-label="设置"
        title="设置"
      >
        <Settings size={17} aria-hidden="true" />
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-72 rounded-md border border-ink/10 bg-panel p-3 text-sm text-ink shadow-soft dark:border-white/10">
          <section className="border-b border-ink/10 pb-3 dark:border-white/10">
            <div className="flex min-w-0 items-center gap-2 text-ink/70">
              <UserRound size={16} aria-hidden="true" />
              <span className="truncate">{user?.email ?? "未登录"}</span>
            </div>
            {user ? (
              <button
                type="button"
                onClick={signOut}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-ink/10 px-3 py-2 font-medium text-ink/70 hover:bg-mist hover:text-ink"
              >
                <LogOut size={15} aria-hidden="true" />
                退出
              </button>
            ) : null}
          </section>

          <section className="pt-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink/45">主题</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => chooseTheme("light")}
                className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 font-medium ${
                  theme === "light" ? "border-moss bg-moss text-white" : "border-ink/10 hover:bg-mist"
                }`}
              >
                <Sun size={15} aria-hidden="true" />
                白天
              </button>
              <button
                type="button"
                onClick={() => chooseTheme("dark")}
                className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 font-medium ${
                  theme === "dark" ? "border-moss bg-moss text-white" : "border-ink/10 hover:bg-mist"
                }`}
              >
                <Moon size={15} aria-hidden="true" />
                黑夜
              </button>
            </div>

            <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/45">高亮色</div>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {accentOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => chooseAccent(option.value)}
                  className="group flex flex-col items-center gap-1 rounded-md p-1 hover:bg-mist"
                  title={option.label}
                  aria-label={option.label}
                >
                  <span className={`grid h-7 w-7 place-items-center rounded-full ${option.swatch}`}>
                    {accent === option.value ? <Check size={15} className="text-white" aria-hidden="true" /> : null}
                  </span>
                  <span className="text-[11px] text-ink/55 group-hover:text-ink">{option.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function readAccent(value: string | null): Accent {
  return accentOptions.some((option) => option.value === value) ? (value as Accent) : "green";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function applyAccent(accent: Accent) {
  document.documentElement.dataset.accent = accent;
}
