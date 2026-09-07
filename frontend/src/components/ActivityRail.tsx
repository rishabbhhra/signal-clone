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
}

export const ActivityRail: React.FC<ActivityRailProps> = ({
  activeTab,
  onSelectTab,
  unreadChatsCount = 0,
  onOpenMenu,
}) => {
  return (
    <nav className="w-14 h-full bg-[#121212] border-r border-[#242428]/60 flex flex-col justify-between items-center py-2.5 select-none flex-shrink-0 z-30">
      {/* Top Section */}
      <div className="flex flex-col items-center gap-1 w-full px-2">
        {/* Hamburger Menu button */}
        <button
          onClick={onOpenMenu}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#8e8e93] hover:text-white hover:bg-[#1e1e22] transition-colors mb-1"
          title="Menu"
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
          <div className="relative w-5 h-5 flex items-center justify-center">
            {/* Signal Stories overlapping card icon */}
            <div className="w-3.5 h-4.5 rounded-sm border-2 border-current rotate-6 absolute -right-0.5 opacity-50" />
            <div className="w-3.5 h-4.5 rounded-sm border-2 border-current -rotate-3 bg-[#121212] relative z-10" />
          </div>
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
