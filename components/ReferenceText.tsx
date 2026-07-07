"use client";

import Link from "next/link";

export function ReferenceText({
  content,
  currentPublicNo,
  className,
  stopPropagation = false
}: {
  content: string;
  currentPublicNo: number;
  className?: string;
  stopPropagation?: boolean;
}) {
  const parts = content.split(/(\d+)/g);

  return (
    <p className={className}>
      {parts.map((part, index) => {
        const value = Number(part);
        const isReference = /^\d+$/.test(part) && Number.isSafeInteger(value) && value > 0 && value <= currentPublicNo;

        if (!isReference) {
          return <span key={`${part}-${index}`}>{part}</span>;
        }

        return (
          <Link
            key={`${part}-${index}`}
            href={`/post/${value}?from=${currentPublicNo}`}
            onClick={(event) => {
              if (stopPropagation) {
                event.stopPropagation();
              }
            }}
            className="font-semibold text-moss underline decoration-moss/40 underline-offset-4 hover:text-clay hover:decoration-clay"
          >
            {part}
          </Link>
        );
      })}
    </p>
  );
}
