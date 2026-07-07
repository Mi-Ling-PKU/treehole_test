"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { HeaderUser } from "@/components/HeaderUser";
import { ThemeToggle } from "@/components/ThemeToggle";

const TOP_ROW_HEIGHT = 72;

export function SiteHeader() {
  const [topRowHeight, setTopRowHeight] = useState(TOP_ROW_HEIGHT);
  const lastScrollY = useRef(0);
  const topRowHeightRef = useRef(TOP_ROW_HEIGHT);

  useEffect(() => {
    let frame = 0;

    function updateCollapsed() {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastScrollY.current;
        const nextHeight =
          y <= 0
            ? TOP_ROW_HEIGHT
            : Math.max(0, Math.min(TOP_ROW_HEIGHT, topRowHeightRef.current - delta));

        if (nextHeight !== topRowHeightRef.current) {
          topRowHeightRef.current = nextHeight;
          setTopRowHeight(nextHeight);
        }

        lastScrollY.current = y;
        frame = 0;
      });
    }

    updateCollapsed();
    window.addEventListener("scroll", updateCollapsed, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateCollapsed);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  const topRowProgress = topRowHeight / TOP_ROW_HEIGHT;

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/92 backdrop-blur">
      <div
        className="overflow-hidden"
        style={{ maxHeight: topRowHeight, opacity: topRowProgress }}
      >
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="-ml-2 rounded-md px-2 py-1 text-lg font-semibold text-ink hover:bg-mist">
            树洞
          </Link>
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <HeaderUser />
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="border-t border-ink/10">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-2 sm:px-6">
          <HeaderNav />
        </div>
      </div>
    </header>
  );
}
