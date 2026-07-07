import type { Metadata } from "next";
import Link from "next/link";
import { HeaderNav } from "@/components/HeaderNav";
import { HeaderUser } from "@/components/HeaderUser";
import "./globals.css";

export const metadata: Metadata = {
  title: "树洞",
  description: "一个匿名倾诉和回应的小站"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',t!=='light')}catch(e){}"
          }}
        />
        <div className="min-h-screen">
          <header className="border-b border-ink/10 bg-paper/85 backdrop-blur">
            <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-start gap-3">
                <Link href="/" className="-ml-2 rounded-md px-2 py-1 text-lg font-semibold text-ink hover:bg-mist">
                  树洞
                </Link>
                <HeaderNav />
              </div>
              <HeaderUser />
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
