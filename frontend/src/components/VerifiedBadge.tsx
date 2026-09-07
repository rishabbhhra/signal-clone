"use client";

import React from "react";
import { Check } from "lucide-react";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = "sm",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4.5 h-4.5",
    lg: "w-5 h-5",
  };

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-signal-blue text-white flex-shrink-0 ${sizeClasses[size]} ${className}`}
      title="Verified Official"
    >
      <Check className={`${iconSizes[size]} stroke-[3.5]`} />
    </span>
  );
};
