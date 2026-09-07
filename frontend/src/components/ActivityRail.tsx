"use client";

import React from "react";
import {
  Menu,
  MessageSquare,
  Phone,
  Layers,
  Settings,
} from "lucide-react";

export type RailTab = "chats" | "calls" | "stories" | "settings";

interface ActivityRailProps {
  activeTab: RailTab;
  onSelectTab: (tab: RailTab) => void;
  unreadChatsCount?: number;
  onOpenMenu?: () => void;
  onToggleSidebar?: () => void;
}

// Custom Signal Hamburger Menu Icon matching official client
const HamburgerIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <rect x="3" y="5.5" width="18" height="2.5" rx="1.25" fill="currentColor" />
    <rect x="3" y="10.75" width="18" height="2.5" rx="1.25" fill="currentColor" />
    <rect x="3" y="16" width="18" height="2.5" rx="1.25" fill="currentColor" />
  </svg>
);

// Custom Signal Filled Speech Bubble for Chats Tab
const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 3.5C6.75 3.5 2.5 7.25 2.5 11.9c0 2.65 1.35 5.05 3.5 6.55-.2 1.35-.8 2.6-1.6 3.55 2.05.05 3.95-.7 5.3-1.95.75.15 1.5.25 2.3.25 5.25 0 9.5-3.75 9.5-8.4S17.25 3.5 12 3.5z" />
  </svg>
);

// Custom Signal Stories Icon matching official client screenshot
const StoriesIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Rear card tilted to the left */}
    <rect x="3" y="6.5" width="9.5" height="13.5" rx="3" transform="rotate(-15 7.75 13.25)" />
    {/* Front card upright */}
    <rect x="8.5" y="4.5" width="10.5" height="15" rx="3.2" fill="#1b1b1d" />
  </svg>
);

export const ActivityRail: React.FC<ActivityRailProps> = ({
  activeTab,
  onSelectTab,
  unreadChatsCount = 0,
  onOpenMenu,
  onToggleSidebar,
}) => {
  return (
    <nav className="w-14 h-full bg-[#1b1b1d] border-r border-[#26262a] flex flex-col justify-between items-center py-2.5 select-none flex-shrink-0 z-30">
      {/* Top Section */}
      <div className="flex flex-col items-center gap-1.5 w-full px-1.5">
        {/* Hamburger Menu button (toggles sidebar visibility) */}
        <button
          onClick={onToggleSidebar || onOpenMenu}
          className="w-11 h-10 rounded-[14px] flex items-center justify-center text-[#d1d5db] hover:text-white hover:bg-[#252528] transition-colors mb-1"
          title="Toggle Sidebar (≡)"
        >
          <HamburgerIcon className="w-5 h-5" />
        </button>

        {/* Chats Tab */}
        <button
          onClick={() => onSelectTab("chats")}
          className={`w-11 h-11 rounded-[14px] flex items-center justify-center relative transition-all ${
            activeTab === "chats"
              ? "bg-[#2c2c30] text-white shadow-xs"
              : "text-[#8e8e93] hover:text-white hover:bg-[#252528]"
          }`}
          title="Chats"
        >
          <ChatBubbleIcon className="w-5 h-5" />
          {unreadChatsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-signal-blue ring-2 ring-[#1b1b1d]" />
          )}
        </button>

        {/* Calls Tab */}
        <button
          onClick={() => onSelectTab("calls")}
          className={`w-11 h-11 rounded-[14px] flex items-center justify-center transition-all ${
            activeTab === "calls"
              ? "bg-[#2c2c30] text-white shadow-xs"
              : "text-[#8e8e93] hover:text-white hover:bg-[#252528]"
          }`}
          title="Calls"
        >
          <Phone className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Stories Tab */}
        <button
          onClick={() => onSelectTab("stories")}
          className={`w-11 h-11 rounded-[14px] flex items-center justify-center transition-all ${
            activeTab === "stories"
              ? "bg-[#2c2c30] text-white shadow-xs"
              : "text-[#8e8e93] hover:text-white hover:bg-[#252528]"
          }`}
          title="Stories"
        >
          <StoriesIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Settings Button */}
      <div className="w-full px-1.5">
        <button
          onClick={() => onSelectTab("settings")}
          className={`w-11 h-11 rounded-[14px] flex items-center justify-center transition-all ${
            activeTab === "settings"
              ? "bg-[#2c2c30] text-white shadow-xs"
              : "text-[#8e8e93] hover:text-white hover:bg-[#252528]"
          }`}
          title="Settings"
        >
          <Settings className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>
    </nav>
  );
};
