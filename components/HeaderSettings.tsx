"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Check, ImageIcon, LogOut, Moon, Plus, RotateCcw, Settings, Sun, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Theme = "dark" | "light";
type Accent = "green" | "blue" | "amber" | "rose" | "slate" | "custom";

const accentOptions: Array<{ value: Exclude<Accent, "custom">; label: string; light: string; dark: string }> = [
  { value: "green", label: "绿色", light: "#5d7461", dark: "#8eb196" },
  { value: "blue", label: "蓝色", light: "#4f6f91", dark: "#7da5d3" },
  { value: "amber", label: "琥珀", light: "#a76f2b", dark: "#db9c4a" },
  { value: "rose", label: "玫红", light: "#a95670", dark: "#db7e9a" },
  { value: "slate", label: "石墨", light: "#64707d", dark: "#9da9b5" }
];

export function HeaderSettings() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<Theme>("dark");
  const [accent, setAccent] = useState<Accent>("green");
  const [customColor, setCustomColor] = useState("#5d7461");
  const [hasCustomBackground, setHasCustomBackground] = useState(false);
  const [backgroundStatus, setBackgroundStatus] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme") === "light" ? "light" : "dark";
    const savedAccent = readAccent(window.localStorage.getItem("accent"));
    const savedCustomColor = readColor(window.localStorage.getItem("customAccent"));
    applyTheme(savedTheme);
    applyAccent(savedAccent, savedCustomColor);
    setTheme(savedTheme);
    setAccent(savedAccent);
    setCustomColor(savedCustomColor);
    setHasCustomBackground(Boolean(window.localStorage.getItem("backgroundImage")));

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
    applyAccent(nextAccent, customColor);
    setAccent(nextAccent);
    window.localStorage.setItem("accent", nextAccent);
  }

  function chooseCustomColor(nextColor: string) {
    const color = readColor(nextColor);
    setCustomColor(color);
    setAccent("custom");
    applyAccent("custom", color);
    window.localStorage.setItem("accent", "custom");
    window.localStorage.setItem("customAccent", color);
  }

  function chooseBackground(file: File | undefined) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setBackgroundStatus("请选择图片文件。");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setBackgroundStatus("暂时无法读取这张图片。");
        return;
      }

      try {
        window.localStorage.setItem("backgroundImage", reader.result);
        applyBackground(reader.result);
        setHasCustomBackground(true);
        setBackgroundStatus("背景已更新。");
      } catch {
        setBackgroundStatus("图片太大，无法保存在浏览器中。");
      }
    };
    reader.onerror = () => setBackgroundStatus("暂时无法读取这张图片。");
    reader.readAsDataURL(file);
  }

  function resetBackground() {
    window.localStorage.removeItem("backgroundImage");
    document.documentElement.style.removeProperty("--background-image");
    setHasCustomBackground(false);
    setBackgroundStatus("已恢复默认背景。");
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

            <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/45">颜色</div>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {accentOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => chooseAccent(option.value)}
                  className="group flex flex-col items-center gap-1 rounded-md p-1 hover:bg-mist"
                  title={option.label}
                  aria-label={option.label}
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full" style={{ backgroundColor: theme === "dark" ? option.dark : option.light }}>
                    {accent === option.value ? <Check size={15} className="text-white" aria-hidden="true" /> : null}
                  </span>
                </button>
              ))}
              <label className="group flex cursor-pointer flex-col items-center gap-1 rounded-md p-1 hover:bg-mist" title="自定义颜色">
                <span className="grid h-7 w-7 place-items-center rounded-full border border-ink/15" style={{ backgroundColor: customColor }}>
                  {accent === "custom" ? <Check size={15} className="text-white" aria-hidden="true" /> : <Plus size={15} className="text-white" aria-hidden="true" />}
                </span>
                <input
                  type="color"
                  value={customColor}
                  onChange={(event) => chooseCustomColor(event.target.value)}
                  className="sr-only"
                  aria-label="自定义颜色"
                />
              </label>
            </div>

            <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/45">背景</div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-ink/10 px-3 py-2 font-medium text-ink/70 hover:bg-mist hover:text-ink">
                <ImageIcon size={15} aria-hidden="true" />
                选择图片
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    chooseBackground(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                onClick={resetBackground}
                disabled={!hasCustomBackground}
                className="inline-flex items-center gap-2 rounded-md border border-ink/10 px-3 py-2 font-medium text-ink/70 hover:bg-mist hover:text-ink disabled:opacity-45"
              >
                <RotateCcw size={15} aria-hidden="true" />
                恢复默认
              </button>
            </div>
            {backgroundStatus ? <p className="mt-2 text-xs text-ink/55">{backgroundStatus}</p> : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}

function readAccent(value: string | null): Accent {
  return value === "custom" || accentOptions.some((option) => option.value === value) ? (value as Accent) : "green";
}

function readColor(value: string | null) {
  return value && /^#[0-9a-f]{6}$/i.test(value) ? value : "#5d7461";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function applyAccent(accent: Accent, customColor: string) {
  document.documentElement.dataset.accent = accent;
  if (accent === "custom") {
    document.documentElement.style.setProperty("--color-moss", hexToRgb(customColor));
  } else {
    document.documentElement.style.removeProperty("--color-moss");
  }
}

function applyBackground(background: string) {
  document.documentElement.style.setProperty("--background-image", `url("${background}") center / cover fixed`);
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  return `${parseInt(value.slice(0, 2), 16)} ${parseInt(value.slice(2, 4), 16)} ${parseInt(value.slice(4, 6), 16)}`;
}
