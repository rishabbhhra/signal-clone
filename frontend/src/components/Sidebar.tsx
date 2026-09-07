"use client";

import React, { useState, useMemo } from "react";
import {
  Edit3,
  Search,
  Check,
  CheckCheck,
  Clock,
  Lock,
  Sparkles,
  Smartphone,
  ChevronDown,
  UserCheck,
} from "lucide-react";
import { useSignal } from "@/context/SignalContext";
import { Avatar } from "@/components/Avatar";
import { format, isToday, isYesterday } from "date-fns";

interface SidebarProps {
  onOpenSettings: () => void;
  onOpenNewChat: () => void;
  onOpenStories: () => void;
  onOpenLinkedDevices: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenSettings,
  onOpenNewChat,
  onOpenStories,
  onOpenLinkedDevices,
}) => {
  const {
    currentUser,
    seedUsers,
    switchUserAccount,
    conversations,
    activeConversation,
    setActiveConversationId,
    typingUsers,
    onlineStatus,
  } = useSignal();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread">("all");
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      // Filter tab
      if (filterTab === "unread" && c.unread_count === 0) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const title = c.type === "group" ? c.name : c.direct_recipient?.display_name;
      const subtitle = c.last_message?.content;
      return (
        (title && title.toLowerCase().includes(q)) ||
        (subtitle && subtitle.toLowerCase().includes(q))
      );
    });
  }, [conversations, filterTab, searchQuery]);

  const formatMessageTime = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isToday(d)) {
        return format(d, "h:mm a");
      }
      if (isYesterday(d)) {
        return "Yesterday";
      }
      return format(d, "MMM d");
    } catch {
      return "";
    }
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 h-full flex flex-col bg-white dark:bg-[#1a1a1e] border-r border-gray-200 dark:border-[#28282e] select-none flex-shrink-0">
      {/* Top Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80">
        <div className="flex items-center gap-3">
          {/* User profile avatar (clicking opens Settings) */}
          <button
            onClick={onOpenSettings}
            className="rounded-full hover:ring-2 hover:ring-signal-blue transition-all"
            title="Open Settings"
          >
            <Avatar
              name={currentUser?.display_name || "Me"}
              url={currentUser?.avatar_url}
              size="sm"
              isOnline={true}
              showOnlineBadge={false}
            />
          </button>

          {/* Quick User Switcher Dropdown (Evaluation Helper) */}
          <div className="relative">
            <button
              onClick={() => setShowUserSwitcher(!showUserSwitcher)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-[#25252a] hover:bg-gray-200 dark:hover:bg-[#2e2e35] transition-colors text-xs font-semibold text-gray-800 dark:text-gray-200"
              title="Switch user account for instant two-way testing"
            >
              <span className="truncate max-w-[100px]">{currentUser?.display_name}</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </button>

            {showUserSwitcher && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowUserSwitcher(false)}
                />
                <div className="absolute left-0 top-full mt-1.5 w-60 bg-white dark:bg-[#202025] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-40 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Switch Test Account
                  </div>
                  {seedUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUserAccount(u.id);
                        setShowUserSwitcher(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                        u.id === currentUser?.id
                          ? "bg-blue-50 dark:bg-blue-900/30 text-signal-blue font-semibold"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a2a30]"
                      }`}
                    >
                      <Avatar name={u.display_name} url={u.avatar_url} size="xs" isOnline={u.is_online} />
                      <div className="flex-1 truncate">
                        <div>{u.display_name}</div>
                        <div className="text-[10px] text-gray-400">@{u.username}</div>
                      </div>
                      {u.id === currentUser?.id && <UserCheck className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
          <button
            onClick={onOpenStories}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#25252a] hover:text-signal-blue transition-colors"
            title="Signal Stories"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenLinkedDevices}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#25252a] hover:text-signal-blue transition-colors"
            title="Linked Devices"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenNewChat}
            className="p-2 rounded-xl bg-signal-blue hover:bg-signal-blue-hover text-white transition-colors shadow-xs"
            title="New Chat (Compose)"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-gray-100 dark:bg-[#141417] text-gray-900 dark:text-gray-100 text-xs placeholder-gray-400 border border-transparent focus:border-signal-blue/50 focus:bg-transparent focus:outline-hidden transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
              filterTab === "all"
                ? "bg-gray-900 text-white dark:bg-white dark:text-black font-semibold"
                : "bg-gray-100 dark:bg-[#222227] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2a2a30]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterTab("unread")}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors flex items-center gap-1 ${
              filterTab === "unread"
                ? "bg-gray-900 text-white dark:bg-white dark:text-black font-semibold"
                : "bg-gray-100 dark:bg-[#222227] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2a2a30]"
            }`}
          >
            <span>Unread</span>
            {conversations.reduce((acc, c) => acc + c.unread_count, 0) > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-signal-blue" />
            )}
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {filteredConversations.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400 space-y-2">
            <Lock className="w-6 h-6 mx-auto text-gray-400/50" />
            <p>No conversations found</p>
            <button
              onClick={onOpenNewChat}
              className="text-signal-blue font-medium hover:underline inline-block mt-1"
            >
              Start a new conversation
            </button>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isGroup = conv.type === "group";
            const directUser = conv.direct_recipient;
            const title = isGroup ? conv.name : directUser?.display_name || "Unknown";
            const avatarUrl = isGroup ? conv.avatar_url : directUser?.avatar_url;

            // Live online presence
            const isOnline =
              !isGroup && directUser
                ? (onlineStatus[directUser.id]?.is_online ?? directUser.is_online)
                : false;

            const isSelected = activeConversation?.id === conv.id;
            const typers = typingUsers[conv.id] || [];
            const isSomeoneTyping = typers.length > 0;

            const lastMsg = conv.last_message;
            const isOutgoing = lastMsg?.sender_id === currentUser?.id;

            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? "bg-blue-50/90 dark:bg-[#26262e] border-l-4 border-signal-blue"
                    : "hover:bg-gray-100 dark:hover:bg-[#212126] border-l-4 border-transparent"
                }`}
              >
                {/* Avatar */}
                <Avatar
                  name={title || "Chat"}
                  url={avatarUrl}
                  size="md"
                  isOnline={isOnline}
                  showOnlineBadge={!isGroup}
                />

                {/* Conversation Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4
                      className={`text-sm font-medium truncate ${
                        isSelected
                          ? "text-signal-blue dark:text-white font-semibold"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {title}
                    </h4>
                    {lastMsg && (
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 font-normal ml-2 flex-shrink-0">
                        {formatMessageTime(lastMsg.created_at)}
                      </span>
                    )}
                  </div>

                  {/* Subtitle / Last Message Snippet */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 truncate min-w-0">
                      {/* Disappearing indicator */}
                      {conv.disappearing_seconds > 0 && (
                        <Clock className="w-3 h-3 text-signal-blue flex-shrink-0" />
                      )}

                      {/* Typing indicator or message snippet */}
                      {isSomeoneTyping ? (
                        <span className="text-signal-blue font-medium animate-pulse">
                          {typers.join(", ")} is typing...
                        </span>
                      ) : lastMsg ? (
                        <div className="flex items-center gap-1 truncate">
                          {/* Receipt checkmark for outgoing */}
                          {isOutgoing && (
                            <span className="flex-shrink-0 inline-flex">
                              {lastMsg.status === "read" ? (
                                <CheckCheck className="w-3.5 h-3.5 text-signal-blue" />
                              ) : lastMsg.status === "delivered" ? (
                                <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-gray-400" />
                              )}
                            </span>
                          )}

                          {isGroup && !isOutgoing && (
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {lastMsg.sender?.display_name?.split(" ")[0]}:
                            </span>
                          )}

                          <span className="truncate">
                            {lastMsg.message_type === "image"
                              ? "📷 Photo"
                              : lastMsg.message_type === "file"
                              ? "📎 Attachment"
                              : lastMsg.message_type === "voice"
                              ? "🎤 Voice Note"
                              : lastMsg.content}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No messages yet</span>
                      )}
                    </div>

                    {/* Unread badge */}
                    {conv.unread_count > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 min-w-[18px] text-[10px] font-bold bg-signal-blue text-white rounded-full text-center flex-shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
