"use client";

import React from "react";

interface AvatarProps {
  name: string;
  url?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isOnline?: boolean;
  showOnlineBadge?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: "w-7 h-7 text-xs",
  sm: "w-9 h-9 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl font-semibold",
};

const badgeSizeClasses = {
  xs: "w-2 h-2 bottom-0 right-0",
  sm: "w-2.5 h-2.5 bottom-0 right-0",
  md: "w-3 h-3 bottom-0 right-0",
  lg: "w-3.5 h-3.5 bottom-0.5 right-0.5",
  xl: "w-4.5 h-4.5 bottom-1 right-1",
};

// Distinct colors for user avatars based on name hash
const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-purple-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
  "bg-indigo-600",
  "bg-teal-600",
];

function getInitials(name: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  url,
  size = "md",
  isOnline = false,
  showOnlineBadge = true,
  className = "",
}) => {
  const sizeClass = sizeClasses[size];
  const badgeSizeClass = badgeSizeClasses[size];
  const initials = getInitials(name);
  const colorClass = getColor(name);

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={name}
          className={`${sizeClass} rounded-full object-cover border border-black/10 dark:border-white/10`}
          onError={(e) => {
            // fallback to initials on broken image
            e.currentTarget.style.display = "none";
            e.currentTarget.nextElementSibling?.classList.remove("hidden");
          }}
        />
      ) : null}
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center text-white font-medium select-none ${colorClass} ${
          url ? "hidden" : ""
        }`}
      >
        {initials}
      </div>

      {showOnlineBadge && isOnline && (
        <span
          className={`absolute ${badgeSizeClass} bg-emerald-500 rounded-full border-2 border-white dark:border-[#1a1a1e] ring-1 ring-black/10`}
          title="Online"
        />
      )}
    </div>
  );
};
