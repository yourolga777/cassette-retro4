"use client";

import { cn } from "@/lib/utils";

interface TagBadgeProps {
  tag: string;
  active?: boolean;
  onClick?: () => void;
}

export function TagBadge({ tag, active, onClick }: TagBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("tag-badge", active && "tag-badge--active")}
    >
      {tag}
    </button>
  );
}
