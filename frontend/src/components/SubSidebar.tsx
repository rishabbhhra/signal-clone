"use client";

import React, { useState, useMemo } from "react";
import {
  SquarePen,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  Link as LinkIcon,
  PhoneCall,
  Plus,
  FileText,
  CheckCheck,
  Check,
  Clock,
  Settings,
  Palette,
  MessageSquare,
  Phone,
  Bell,
  Shield,
  PieChart,
  Archive,
  Heart,
  ChevronDown,
  UserCheck,
  ChevronLeft,
  Users,
  AtSign,
  Hash,
} from "lucide-react";
import { RailTab } from "./ActivityRail";
import { useSignal } from "@/context/SignalContext";
import { Avatar } from "./Avatar";
import { VerifiedBadge } from "./VerifiedBadge";
import { format, isToday, isYesterday } from "date-fns";

export type SettingsSection =
  | "profile"
  | "general"
  | "appearance"
  | "chats"
  | "calls"
  | "notifications"
  | "privacy"
  | "data_usage"
  | "backups"
  | "donate";

interface SubSidebarProps {
  activeRailTab: RailTab;
  activeSettingsSection: SettingsSection;
  onSelectSettingsSection: (section: SettingsSection) => void;
  onOpenCompose: () => void;
  onOpenNewGroup: () => void;
  onCreateCallLink: () => void;
  onOpenAddStory: () => void;
}

export const SubSidebar: React.FC<SubSidebarProps> = ({
  activeRailTab,
  activeSettingsSection,
  onSelectSettingsSection,
  onOpenCompose,
  onOpenNewGroup,
  onCreateCallLink,
  onOpenAddStory,
}) => {
  const {
    currentUser,
    seedUsers,
    switchUserAccount,
    conversations,
    activeConversation,
    setActiveConversationId,
    selectOrStartDirectChat,
    typingUsers,
    onlineStatus,
  } = useSignal();

  const [searchQuery, setSearchQuery] = useState("");
  const [showChatsMenu, setShowChatsMenu] = useState(false);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const [isNewChatMode, setIsNewChatMode] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");

  const sampleContacts = useMemo(() => [
    { id: "c-harshith", name: "Harshith Reddy BU SIH...", initials: "HT", color: "#15803d", subtitle: "" },
    { id: "c-joseph", name: "Joseph Sir", initials: "JS", color: "#7e22ce", subtitle: "" },
    { id: "c-nitish", name: "Nitish Manocha...", initials: "NM", color: "#1d4ed8", subtitle: "" },
    { id: "c-siddhartha", name: "Siddhartha BU SIH Team...", initials: "ST", color: "#b45309", subtitle: "" },
    { id: "c-vaibhav", name: "Vaibhav IOT Jr", initials: "VJ", color: "#a16207", subtitle: "" },
    { id: "c-venugopal", name: "Venugopal BU", initials: "VB", color: "#be185d", subtitle: "" },
  ], []);

  const combinedContacts = useMemo(() => {
    const list = [...sampleContacts];
    seedUsers.forEach((u) => {
      if (u.id !== currentUser?.id && !list.some((c) => c.name === u.display_name)) {
        list.push({
          id: u.id,
          name: u.display_name,
          initials: u.display_name.slice(0, 2).toUpperCase(),
          color: "#2563eb",
          subtitle: `@${u.username}`,
        });
      }
    });
    return list;
  }, [seedUsers, currentUser, sampleContacts]);

  // Format message time
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isToday(d)) return format(d, "h:mm a").toLowerCase();
      if (isYesterday(d)) return "Yesterday";
      return format(d, "MMM d");
    } catch {
      return "";
    }
  };

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const title =
        c.type === "note_to_self"
          ? "Note to Self"
          : c.type === "group"
          ? c.name
          : c.direct_recipient?.display_name;
      const last = c.last_message?.content;
      return (
        (title && title.toLowerCase().includes(q)) ||
        (last && last.toLowerCase().includes(q))
      );
    });
  }, [conversations, searchQuery]);

  return (
    <div className="w-80 lg:w-[340px] h-full bg-[#242426] border-r border-[#2c2c30] flex flex-col select-none flex-shrink-0 z-20">
      {/* 1. CHATS TAB - NEW CHAT VIEW (Screenshot 5: media_1788800001867.png) */}
      {activeRailTab === "chats" && isNewChatMode && (
        <>
          {/* Header */}
          <div className="h-14 px-3 flex items-center gap-2 border-b border-[#242428]/40">
            <button
              onClick={() => setIsNewChatMode(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#25252a] transition-colors"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-white font-bold text-sm tracking-tight">New chat</h2>
          </div>

          {/* Search Box */}
          <div className="px-3 py-2.5">
            <div className="relative flex items-center bg-[#242428] rounded-xl px-3 py-1.5 border border-transparent focus-within:border-[#383842]">
              <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Name, username, or number"
                value={newChatSearch}
                onChange={(e) => setNewChatSearch(e.target.value)}
                className="bg-transparent text-white text-xs placeholder-gray-500 focus:outline-hidden flex-1"
                autoFocus
              />
            </div>
          </div>

          {/* Action Options */}
          <div className="px-2 space-y-0.5">
            <button
              onClick={() => {
                setIsNewChatMode(false);
                onOpenNewGroup();
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#222226] text-left transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#28282c] text-gray-200 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-200">New group</span>
            </button>

            <button
              onClick={() => setNewChatSearch("@")}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#222226] text-left transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#28282c] text-gray-200 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                <AtSign className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-200">Find by username</span>
            </button>

            <button
              onClick={() => setNewChatSearch("+")}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#222226] text-left transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#28282c] text-gray-200 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                <Hash className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-200">Find by phone number</span>
            </button>
          </div>

          {/* Section: Contacts */}
          <div className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400">
            Contacts
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {/* Note to Self row */}
            {(!newChatSearch.trim() || "note to self".includes(newChatSearch.toLowerCase())) && (
              <div
                onClick={() => {
                  const noteConv = conversations.find((c) => c.type === "note_to_self");
                  if (noteConv) setActiveConversationId(noteConv.id);
                  setIsNewChatMode(false);
                }}
                className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#222226] cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#28282c] text-gray-200 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-xs font-semibold text-white truncate">Note to Self</span>
                  <VerifiedBadge size="sm" />
                </div>
              </div>
            )}

            {/* Other Contacts */}
            {combinedContacts
              .filter((c) => {
                if (!newChatSearch.trim()) return true;
                const q = newChatSearch.toLowerCase();
                return (
                  c.name.toLowerCase().includes(q) ||
                  (c.subtitle && c.subtitle.toLowerCase().includes(q))
                );
              })
              .map((c) => (
                <div
                  key={c.id}
                  onClick={async () => {
                    await selectOrStartDirectChat(c.id);
                    setIsNewChatMode(false);
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#222226] cursor-pointer transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{c.name}</div>
                    {c.subtitle && <div className="text-[10px] text-gray-400 truncate">{c.subtitle}</div>}
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {/* 1. CHATS TAB - MAIN LIST */}
      {activeRailTab === "chats" && !isNewChatMode && (
        <>
          {/* Header */}
          <div className="h-14 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-white font-bold text-lg tracking-tight">Chats</h2>
              {/* Optional Quick User Switcher dropdown */}
              <button
                onClick={() => setShowUserSwitcher(!showUserSwitcher)}
                className="text-[10px] bg-[#28282c] hover:bg-[#323238] px-2 py-0.5 rounded-md text-gray-300 font-mono flex items-center gap-1 transition-colors"
                title="Switch test account"
              >
                <span>{currentUser?.display_name?.split(" ")[0]}</span>
                <ChevronDown className="w-2.5 h-2.5 text-gray-400" />
              </button>

              {showUserSwitcher && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserSwitcher(false)}
                  />
                  <div className="absolute left-14 top-12 w-56 bg-[#222226] border border-[#2f2f36] rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Switch User
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
                            ? "bg-signal-blue/20 text-signal-blue font-semibold"
                            : "text-gray-300 hover:bg-[#2c2c33]"
                        }`}
                      >
                        <Avatar name={u.display_name} url={u.avatar_url} size="xs" isOnline={u.is_online} />
                        <div className="flex-1 truncate">
                          <div>{u.display_name}</div>
                          <div className="text-[10px] text-gray-400">@{u.username}</div>
                        </div>
                        {u.id === currentUser?.id && <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 text-gray-400">
              <button
                onClick={() => setIsNewChatMode(true)}
                className="p-1.5 hover:text-white rounded-lg hover:bg-[#25252a] transition-colors"
                title="New Chat"
              >
                <SquarePen className="w-4.5 h-4.5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowChatsMenu(!showChatsMenu)}
                  className="p-1.5 hover:text-white rounded-lg hover:bg-[#25252a] transition-colors"
                  title="More Options"
                >
                  <MoreHorizontal className="w-4.5 h-4.5" />
                </button>

                {showChatsMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowChatsMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-44 bg-[#222226] border border-[#2f2f36] rounded-xl shadow-2xl py-1 z-50 text-xs text-gray-300">
                      <button
                        onClick={() => {
                          setShowChatsMenu(false);
                          onOpenNewGroup();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-[#2d2d34] transition-colors"
                      >
                        New Group
                      </button>
                      <button
                        onClick={() => {
                          setShowChatsMenu(false);
                          onOpenCompose();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-[#2d2d34] transition-colors"
                      >
                        Find by Username / Phone
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="px-3 pb-2.5">
            <div className="relative flex items-center bg-[#242428] rounded-xl px-3 py-1.5 border border-transparent focus-within:border-[#383842]">
              <Search className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white text-xs placeholder-gray-500 focus:outline-hidden flex-1"
              />
              <button
                className="text-gray-500 hover:text-gray-300 ml-1.5 flex-shrink-0"
                title="Filter chats"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {filteredConversations.map((conv) => {
              const isNoteToSelf = conv.type === "note_to_self";
              const isGroup = conv.type === "group";
              const directUser = conv.direct_recipient;
              const title = isNoteToSelf
                ? "Note to Self"
                : isGroup
                ? conv.name || "Group"
                : directUser?.display_name || "Unknown";

              const isSelected = activeConversation?.id === conv.id;
              const lastMsg = conv.last_message;
              const isOutgoing = lastMsg?.sender_id === currentUser?.id;
              const isOnline = !isNoteToSelf && !isGroup && directUser ? onlineStatus[directUser.id]?.is_online : false;
              const typers = typingUsers[conv.id] || [];

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#28282c] text-white"
                      : "hover:bg-[#222226] text-gray-300"
                  }`}
                >
                  {/* Avatar */}
                  {isNoteToSelf ? (
                    <div className="w-11 h-11 rounded-full bg-[#dcdfe4] text-[#1c1c20] flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 stroke-[2]" />
                    </div>
                  ) : (
                    <Avatar
                      name={title}
                      url={isGroup ? conv.avatar_url : directUser?.avatar_url}
                      size="md"
                      isOnline={isOnline}
                      showOnlineBadge={!isGroup}
                    />
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold text-sm text-white truncate">
                          {title}
                        </span>
                        {isNoteToSelf && <VerifiedBadge size="sm" />}
                      </div>

                      {lastMsg && (
                        <span className="text-[11px] text-gray-400 font-normal ml-2 flex-shrink-0">
                          {formatTime(lastMsg.created_at)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="truncate min-w-0 flex items-center gap-1">
                        {typers.length > 0 ? (
                          <span className="text-signal-blue font-medium animate-pulse">
                            {typers.join(", ")} is typing...
                          </span>
                        ) : (
                          <>
                            {isOutgoing && (
                              <span className="flex-shrink-0">
                                {lastMsg?.status === "read" ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-signal-blue" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-gray-400" />
                                )}
                              </span>
                            )}
                            <span className="truncate">
                              {lastMsg ? lastMsg.content || "[Attachment]" : "No messages yet"}
                            </span>
                          </>
                        )}
                      </div>

                      {conv.unread_count > 0 && (
                        <span className="w-4.5 h-4.5 rounded-full bg-signal-blue text-white font-bold text-[10px] flex items-center justify-center ml-1.5 flex-shrink-0">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 2. CALLS TAB */}
      {activeRailTab === "calls" && (
        <>
          {/* Header */}
          <div className="h-14 px-4 flex items-center justify-between">
            <h2 className="text-white font-bold text-lg tracking-tight">Calls</h2>
            <div className="flex items-center gap-1 text-gray-400">
              <button
                onClick={onCreateCallLink}
                className="p-1.5 hover:text-white rounded-lg hover:bg-[#25252a] transition-colors"
                title="New Call"
              >
                <PhoneCall className="w-4.5 h-4.5" />
              </button>
              <button
                className="p-1.5 hover:text-white rounded-lg hover:bg-[#25252a] transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="px-3 pb-2.5">
            <div className="relative flex items-center bg-[#242428] rounded-xl px-3 py-1.5">
              <Search className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent text-white text-xs placeholder-gray-500 focus:outline-hidden flex-1"
              />
              <button className="text-gray-500 hover:text-gray-300 ml-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action: Create a Call Link */}
          <div className="px-2">
            <button
              onClick={onCreateCallLink}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-[#222226] text-white transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#28282c] flex items-center justify-center flex-shrink-0">
                <LinkIcon className="w-5 h-5 text-gray-300" />
              </div>
              <span className="font-semibold text-sm">Create a Call Link</span>
            </button>
          </div>

          {/* Empty State */}
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <h3 className="text-base font-bold text-white mb-1">No calls</h3>
            <p className="text-xs text-gray-500">Recent calls will appear here.</p>
          </div>
        </>
      )}

      {/* 3. STORIES TAB */}
      {activeRailTab === "stories" && (
        <>
          {/* Header */}
          <div className="h-14 px-4 flex items-center justify-between">
            <h2 className="text-white font-bold text-lg tracking-tight">Stories</h2>
            <div className="flex items-center gap-1 text-gray-400">
              <button
                onClick={onOpenAddStory}
                className="p-1.5 hover:text-white rounded-lg hover:bg-[#25252a] transition-colors"
                title="Add Story"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                className="p-1.5 hover:text-white rounded-lg hover:bg-[#25252a] transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="px-3 pb-2.5">
            <div className="relative flex items-center bg-[#242428] rounded-xl px-3 py-1.5">
              <Search className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent text-white text-xs placeholder-gray-500 focus:outline-hidden flex-1"
              />
            </div>
          </div>

          {/* My Story Row */}
          <div className="px-2">
            <div
              onClick={onOpenAddStory}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#222226] cursor-pointer transition-colors"
            >
              <div className="relative w-11 h-11 rounded-full bg-[#dcdfe4] text-[#1c1c20] flex items-center justify-center font-semibold text-base flex-shrink-0">
                {currentUser?.display_name ? currentUser.display_name[0].toUpperCase() : "U"}
                <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-signal-blue text-white flex items-center justify-center border-2 border-[#1b1b1d]">
                  <Plus className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-white">My Story</h4>
                <p className="text-xs text-gray-400">Add a story</p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <h3 className="text-base font-bold text-white mb-1">No stories</h3>
            <p className="text-xs text-gray-500">New updates will appear here.</p>
          </div>
        </>
      )}

      {/* 4. SETTINGS TAB */}
      {activeRailTab === "settings" && (
        <>
          {/* Header */}
          <div className="h-14 px-5 flex items-center">
            <h2 className="text-white font-bold text-lg tracking-tight">Settings</h2>
          </div>

          {/* User Profile Card (Screenshot media_1788808797490.png) */}
          <div className="px-3.5 pb-3">
            <div
              onClick={() => onSelectSettingsSection("profile")}
              className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3.5 ${
                activeSettingsSection === "profile"
                  ? "bg-[#323236] text-white shadow-xs ring-1 ring-white/10"
                  : "bg-[#2c2c30]/80 text-gray-200 hover:bg-[#323236]"
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-[#cfd2d8] text-[#1c1c20] flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-xs">
                {currentUser?.display_name ? currentUser.display_name[0].toUpperCase() : "R"}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm text-white truncate">
                  {currentUser?.display_name || "Rishabh"}
                </h4>
                <p className="text-xs text-[#8e8e93] font-normal truncate mt-0.5">
                  {currentUser?.phone_number || "062041 65936"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu Items */}
          <div className="flex-1 overflow-y-auto px-2.5 space-y-0.5 text-sm font-normal">
            {[
              { id: "general", label: "General", icon: Settings },
              { id: "appearance", label: "Appearance", icon: Palette },
              { id: "chats", label: "Chats", icon: MessageSquare },
              { id: "calls", label: "Calls", icon: Phone },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "privacy", label: "Privacy", icon: Shield },
              { id: "data_usage", label: "Data usage", icon: PieChart },
              { id: "backups", label: "Backups", icon: Archive },
              { id: "donate", label: "Donate to Signal", icon: Heart },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = activeSettingsSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSettingsSection(item.id as SettingsSection)}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-colors text-left ${
                    isSelected
                      ? "bg-[#2c2c30] text-white font-medium"
                      : "text-gray-300 hover:bg-[#2c2c30]/60 hover:text-white"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 text-gray-400 stroke-[1.8]" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
