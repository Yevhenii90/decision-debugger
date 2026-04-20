"use client";

import type { HistoryItem } from "@/lib/types";

type HistoryListProps = {
  items: HistoryItem[];
  onOpen: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function HistoryList({ items, onOpen, onDelete }: HistoryListProps) {
  return (
    <section aria-labelledby="history-heading" className="w-full border-t border-[#1f7a36] pt-8">
      <h2 id="history-heading" className="mb-4 text-lg font-semibold text-[#7dff91]">
        History
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-[#9fbf92]">
          Your last 10 analyses will appear here.
        </p>
      ) : (
        <ol className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded border border-[#1f7a36] bg-[#071007] p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <button
                type="button"
                onClick={() => onOpen(item)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="block truncate text-sm font-medium text-[#d6b85a]">
                  {item.result.title}
                </span>
                <span className="mt-1 block line-clamp-2 text-sm leading-6 text-[#b8ffc2]">
                  {item.decision}
                </span>
                <span className="mt-2 block text-xs text-[#9fbf92]">
                  {item.mode} · {dateFormatter.format(new Date(item.createdAt))}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="rounded border border-[#1f7a36] px-3 py-2 text-sm font-medium text-[#7dff91] transition hover:bg-[#0d1f0d]"
              >
                Delete
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
