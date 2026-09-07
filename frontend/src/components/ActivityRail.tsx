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

// Custom Signal Stories Icon matching official client
const StoriesIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="5.5" y="4" width="11" height="16" rx="3" />
    <path d="M18.5 7.5A2.5 2.5 0 0 1 20 9.8v6.4a2.5 2.5 0 0 1-1.5 2.3" />
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
    <nav className="w-14 h-full bg-[#121212] border-r border-[#242428]/60 flex flex-col justify-between items-center py-2.5 select-none flex-shrink-0 z-30">
      {/* Top Section */}
      <div className="flex flex-col items-center gap-1 w-full px-2">
        {/* Hamburger Menu button (toggles sidebar visibility) */}
        <button
          onClick={onToggleSidebar || onOpenMenu}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#8e8e93] hover:text-white hover:bg-[#1e1e22] transition-colors mb-1"
          title="Toggle Sidebar (≡)"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Chats Tab */}
        <button
          onClick={() => onSelectTab("chats")}
          className={`w-10 h-10 rounded-xl flex items-center justify-center relative transition-all ${
            activeTab === "chats"
              ? "bg-[#28282c] text-white shadow-xs"
              : "text-[#8e8e93] hover:text-white hover:bg-[#1e1e22]"
          }`}
          title="Chats"
        >
          <MessageSquare className="w-5 h-5 fill-current/20 stroke-[2.2]" />
          {unreadChatsCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-signal-blue ring-2 ring-[#121212]" />
          )}
        </button>

        {/* Calls Tab */}
        <button
          onClick={() => onSelectTab("calls")}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTab === "calls"
              ? "bg-[#28282c] text-white shadow-xs"
              : "text-[#8e8e93] hover:text-white hover:bg-[#1e1e22]"
          }`}
          title="Calls"
        >
          <Phone className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Stories Tab */}
        <button
          onClick={() => onSelectTab("stories")}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTab === "stories"
              ? "bg-[#28282c] text-white shadow-xs"
              : "text-[#8e8e93] hover:text-white hover:bg-[#1e1e22]"
          }`}
          title="Stories"
        >
          <StoriesIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Settings Button */}
      <div className="w-full px-2">
        <button
          onClick={() => onSelectTab("settings")}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTab === "settings"
              ? "bg-[#28282c] text-white shadow-xs"
              : "text-[#8e8e93] hover:text-white hover:bg-[#1e1e22]"
          }`}
          title="Settings"
        >
          <Settings className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>
    </nav>
  );
};
