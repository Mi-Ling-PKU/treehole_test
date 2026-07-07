"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { HeaderUser } from "@/components/HeaderUser";
import { ThemeToggle } from "@/components/ThemeToggle";

const TOP_ROW_HEIGHT = 68;

export function SiteHeader() {
  const [topRowHeight, setTopRowHeight] = useState(TOP_ROW_HEIGHT);
  const topRowHeightRef = useRef(TOP_ROW_HEIGHT);

  useEffect(() => {
    let frame = 0;

    function updateCollapsed() {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const nextHeight = Math.max(0, Math.min(TOP_ROW_HEIGHT, TOP_ROW_HEIGHT - y));

        if (nextHeight !== topRowHeightRef.current) {
          topRowHeightRef.current = nextHeight;
          setTopRowHeight(nextHeight);
        }
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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#22272e] text-white">
      <div
        className="overflow-hidden"
        style={{ maxHeight: topRowHeight, opacity: topRowProgress }}
      >
        <div className="mx-auto flex max-w-3xl flex-nowrap items-center justify-between gap-2 px-4 py-4 sm:px-6">
          <Link href="/" className="-ml-2 shrink-0 rounded-md px-2 py-1 text-lg font-semibold text-white hover:bg-white/10">
            树洞
          </Link>
          <div className="flex min-w-0 flex-1 flex-nowrap items-center justify-end gap-2">
            <HeaderUser />
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-2 sm:px-6">
          <HeaderNav />
        </div>
      </div>
    </header>
  );
}
