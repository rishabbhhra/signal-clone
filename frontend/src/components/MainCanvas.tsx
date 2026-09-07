"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Phone,
  Video,
  Search,
  MoreHorizontal,
  Smile,
  Mic,
  Plus,
  FileText,
  CheckCheck,
  Check,
  Lock,
  User,
  Edit2,
  Trash2,
  CornerUpLeft,
  X,
  Clock,
  Sparkles,
  PhoneCall,
  Shield,
  Download,
  BellOff,
  Settings as SettingsIcon,
  Image as ImageIcon,
  CheckCircle2,
  RotateCcw,
  Pin,
  Archive,
  Ban,
  ChevronRight,
  Link as LinkIcon,
} from "lucide-react";
import { RailTab } from "./ActivityRail";
import { SettingsSection } from "./SubSidebar";
import { SettingsViews } from "./SettingsViews";
import { useSignal } from "@/context/SignalContext";
import { VerifiedBadge } from "./VerifiedBadge";
import { Avatar } from "./Avatar";
import { format, isToday, isYesterday } from "date-fns";

interface MainCanvasProps {
  activeRailTab: RailTab;
  activeSettingsSection: SettingsSection;
  onOpenSafetyNumber: (userId: string, name: string) => void;
  onStartCall: (isVideo: boolean) => void;
  onCreateCallLink: () => void;
  onOpenAddStory: () => void;
  onToggleInfoDrawer: () => void;
}

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "👏", "🔥", "🎉"];

const DISAPPEARING_OPTIONS = [
  { label: "Off", seconds: 0 },
  { label: "4 weeks", seconds: 2419200 },
  { label: "1 week", seconds: 604800 },
  { label: "1 day", seconds: 86400 },
  { label: "8 hours", seconds: 28800 },
  { label: "1 hour", seconds: 3600 },
  { label: "5 minutes", seconds: 300 },
  { label: "30 seconds", seconds: 30 },
];

const MUTE_OPTIONS = [
  "1 hour",
  "8 hours",
  "1 day",
  "7 days",
  "Always",
];

export const MainCanvas: React.FC<MainCanvasProps> = ({
  activeRailTab,
  activeSettingsSection,
  onOpenSafetyNumber,
  onStartCall,
  onCreateCallLink,
  onOpenAddStory,
  onToggleInfoDrawer,
}) => {
  const {
    currentUser,
    activeConversation,
    messages,
    sendMessage,
    sendAttachment,
    sendTyping,
    toggleReaction,
    deleteMessage,
    updateDisappearingTimer,
    updateProfile,
    theme,
    toggleTheme,
    soundEnabled,
    setSoundEnabled,
    typingUsers,
    onlineStatus,
    settings,
  } = useSignal();

  // Chat message state
  const [inputContent, setInputContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // 3-dots overflow menu states (Screenshot 4: media_1788799900728.png)
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showDisappearingSubmenu, setShowDisappearingSubmenu] = useState(false);
  const [showMuteSubmenu, setShowMuteSubmenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom on message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const formatMessageTime = (iso: string) => {
    try {
      return format(new Date(iso), "h:mm a").toLowerCase();
    } catch {
      return "";
    }
  };

  const convertEmoticonsToEmoji = (str: string) => {
    if (!settings?.convertEmoticons) return str;
    return str
      .replace(/:-?\)/g, "🙂")
      .replace(/:-?D/g, "😃")
      .replace(/:-?P/gi, "😛")
      .replace(/;-?\)/g, "😉")
      .replace(/:-?\(/g, "🙁")
      .replace(/:-?O/gi, "😮")
      .replace(/<3/g, "❤️")
      .replace(/:-?\*/g, "😘");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let val = e.target.value;
    if (settings?.convertEmoticons) {
      val = convertEmoticonsToEmoji(val);
    }
    setInputContent(val);
    sendTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!inputContent.trim()) return;
    const text = inputContent.trim();
    setInputContent("");
    sendTyping(false);
    const replyId = replyingTo ? replyingTo.id : undefined;
    setReplyingTo(null);
    try {
      await sendMessage(text, replyId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const replyId = replyingTo ? replyingTo.id : undefined;
    setReplyingTo(null);
    try {
      await sendAttachment(file, replyId);
    } catch (err) {
      console.error(err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ==========================================
  // VIEW 1: CALLS TAB
  // ==========================================
  if (activeRailTab === "calls") {
    return (
      <div className="flex-1 h-full bg-[#121214] flex flex-col items-center justify-center text-center p-8 select-none">
        <div
          onClick={onCreateCallLink}
          className="w-16 h-16 rounded-full flex items-center justify-center text-gray-500 hover:text-white cursor-pointer transition-transform hover:scale-105 mb-4"
        >
          <Phone className="w-10 h-10 stroke-[1.5]" />
        </div>
        <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
          Click <span className="inline-block px-1">📞</span> to start a new voice or video call.
        </p>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: STORIES TAB
  // ==========================================
  if (activeRailTab === "stories") {
    return (
      <div className="flex-1 h-full bg-[#121214] flex flex-col items-center justify-center text-center p-8 select-none">
        <div
          onClick={onOpenAddStory}
          className="w-16 h-16 rounded-full flex items-center justify-center text-gray-500 hover:text-white cursor-pointer transition-transform hover:scale-105 mb-4"
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="w-6 h-8 rounded-sm border-2 border-current rotate-6 absolute -right-0.5 opacity-50" />
            <div className="w-6 h-8 rounded-sm border-2 border-current -rotate-3 bg-[#121214] relative z-10" />
          </div>
        </div>
        <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
          Click <span className="font-semibold text-gray-200">+</span> to add an update.
        </p>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: SETTINGS TAB
  // ==========================================
  if (activeRailTab === "settings") {
    return <SettingsViews activeSection={activeSettingsSection} />;
  }

  // ==========================================
  // VIEW 4: CHATS TAB (MAIN CHAT PANE)
  // ==========================================
  if (!activeConversation) {
    return (
      <div className="flex-1 h-full bg-[#121214] flex flex-col items-center justify-center text-center p-8 select-none">
        <div className="w-16 h-16 rounded-full bg-[#1a1a1f] flex items-center justify-center text-signal-blue mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white">Signal Desktop</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-xs">
          Select a chat to begin private, end-to-end encrypted messaging.
        </p>
      </div>
    );
  }

  const isNoteToSelf = activeConversation.type === "note_to_self";
  const isGroup = activeConversation.type === "group";
  const directUser = activeConversation.direct_recipient;
  const chatTitle = isNoteToSelf
    ? "Note to Self"
    : isGroup
    ? activeConversation.name
    : directUser?.display_name || "Contact";

  const isDirectOnline =
    !isNoteToSelf && !isGroup && directUser ? onlineStatus[directUser.id]?.is_online : false;
  const typers = typingUsers[activeConversation.id] || [];

  return (
    <div className="flex-1 h-full bg-[#121214] flex flex-col relative overflow-hidden select-none">
      {/* Top Header (Matching Screenshot 1) */}
      <header className="h-14 px-4 bg-[#121214] border-b border-[#242428]/70 flex items-center justify-between z-10">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          {isNoteToSelf ? (
            <div className="w-9 h-9 rounded-full bg-[#dcdfe4] text-[#1c1c20] flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 stroke-[2]" />
            </div>
          ) : (
            <Avatar
              name={chatTitle || "Chat"}
              url={isGroup ? activeConversation.avatar_url : directUser?.avatar_url}
              size="sm"
              isOnline={isDirectOnline}
              showOnlineBadge={!isGroup}
            />
          )}

          {/* Title & Subtitle */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white truncate">{chatTitle}</h3>
              {isNoteToSelf && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-[11px] text-gray-400 truncate">
              {isNoteToSelf ? (
                "Official chat"
              ) : typers.length > 0 ? (
                <span className="text-signal-blue animate-pulse">{typers.join(", ")} is typing...</span>
              ) : isGroup ? (
                `${activeConversation.participants.length} members`
              ) : isDirectOnline ? (
                "Online"
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>

        {/* Right header buttons */}
        <div className="flex items-center gap-1.5 text-gray-400">
          {!isNoteToSelf && (
            <>
              <button
                onClick={() => onStartCall(false)}
                className="p-1.5 hover:text-white rounded-lg hover:bg-[#25252a] transition-colors"
                title="Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => onStartCall(true)}
                className="p-1.5 hover:text-white rounded-lg hover:bg-[#25252a] transition-colors"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            className="p-1.5 hover:text-white rounded-lg hover:bg-[#25252a] transition-colors"
            title="Search in conversation"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* 3-dots overflow menu (Screenshot 4: media_1788799900728.png) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowChatMenu(!showChatMenu);
                setShowDisappearingSubmenu(false);
                setShowMuteSubmenu(false);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                showChatMenu ? "text-white bg-[#25252a]" : "hover:text-white hover:bg-[#25252a]"
              }`}
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showChatMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => {
                    setShowChatMenu(false);
                    setShowDisappearingSubmenu(false);
                    setShowMuteSubmenu(false);
                  }}
                />
                <div className="absolute right-0 top-10 w-56 bg-[#1e1e22] border border-[#2e2e36] rounded-2xl shadow-2xl py-1.5 z-50 text-gray-200 animate-in fade-in zoom-in-95 duration-100">
                  {/* 1. Disappearing messages */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowDisappearingSubmenu(!showDisappearingSubmenu);
                        setShowMuteSubmenu(false);
                      }}
                      onMouseEnter={() => setShowDisappearingSubmenu(true)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-[#2a2a32] hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Disappearing messages</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    {showDisappearingSubmenu && (
                      <div
                        className="absolute right-full top-0 mr-1 w-36 bg-[#1e1e22] border border-[#2e2e36] rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-75"
                        onMouseLeave={() => setShowDisappearingSubmenu(false)}
                      >
                        {DISAPPEARING_OPTIONS.map((opt) => (
                          <button
                            key={opt.label}
                            onClick={async () => {
                              try {
                                await updateDisappearingTimer(activeConversation.id, opt.seconds);
                                showToast(`Disappearing messages set to ${opt.label}`);
                              } catch (e) {
                                console.error(e);
                              }
                              setShowChatMenu(false);
                              setShowDisappearingSubmenu(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors ${
                              activeConversation.disappearing_seconds === opt.seconds
                                ? "text-signal-blue font-semibold bg-signal-blue/10"
                                : "text-gray-200 hover:bg-[#2a2a32] hover:text-white"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {activeConversation.disappearing_seconds === opt.seconds && (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. Mute notifications */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowMuteSubmenu(!showMuteSubmenu);
                        setShowDisappearingSubmenu(false);
                      }}
                      onMouseEnter={() => setShowMuteSubmenu(true)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-[#2a2a32] hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <BellOff className="w-4 h-4 text-gray-400" />
                        <span>Mute notifications</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    {showMuteSubmenu && (
                      <div
                        className="absolute right-full top-0 mr-1 w-36 bg-[#1e1e22] border border-[#2e2e36] rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-75"
                        onMouseLeave={() => setShowMuteSubmenu(false)}
                      >
                        {MUTE_OPTIONS.map((dur) => (
                          <button
                            key={dur}
                            onClick={() => {
                              setIsMuted(true);
                              showToast(`Notifications muted for ${dur}`);
                              setShowChatMenu(false);
                              setShowMuteSubmenu(false);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-left text-gray-200 hover:bg-[#2a2a32] hover:text-white transition-colors"
                          >
                            {dur}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Chat settings */}
                  <button
                    onClick={() => {
                      setShowChatMenu(false);
                      onToggleInfoDrawer();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-200 hover:bg-[#2a2a32] hover:text-white transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4 text-gray-400" />
                    <span>Chat settings</span>
                  </button>

                  {/* 4. All media */}
                  <button
                    onClick={() => {
                      setShowChatMenu(false);
                      onToggleInfoDrawer();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-200 hover:bg-[#2a2a32] hover:text-white transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    <span>All media</span>
                  </button>

                  {/* Divider */}
                  <div className="my-1 border-t border-[#2e2e36]" />

                  {/* 5. Select messages */}
                  <button
                    onClick={() => {
                      setShowChatMenu(false);
                      showToast("Select messages mode enabled");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-200 hover:bg-[#2a2a32] hover:text-white transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-gray-400" />
                    <span>Select messages</span>
                  </button>

                  {/* 6. Mark as unread */}
                  <button
                    onClick={() => {
                      setShowChatMenu(false);
                      showToast("Chat marked as unread");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-200 hover:bg-[#2a2a32] hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-gray-400" />
                    <span>Mark as unread</span>
                  </button>

                  {/* 7. Pin chat */}
                  <button
                    onClick={() => {
                      setShowChatMenu(false);
                      showToast("Chat pinned to top");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-200 hover:bg-[#2a2a32] hover:text-white transition-colors"
                  >
                    <Pin className="w-4 h-4 text-gray-400" />
                    <span>Pin chat</span>
                  </button>

                  {/* 8. Archive */}
                  <button
                    onClick={() => {
                      setShowChatMenu(false);
                      showToast("Chat moved to archive");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-200 hover:bg-[#2a2a32] hover:text-white transition-colors"
                  >
                    <Archive className="w-4 h-4 text-gray-400" />
                    <span>Archive</span>
                  </button>

                  {/* 9. Block */}
                  <button
                    onClick={() => {
                      setShowChatMenu(false);
                      showToast("User blocked");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-200 hover:bg-[#2a2a32] hover:text-white transition-colors"
                  >
                    <Ban className="w-4 h-4 text-gray-400" />
                    <span>Block</span>
                  </button>

                  {/* 10. Delete */}
                  <button
                    onClick={() => {
                      setShowChatMenu(false);
                      showToast("Chat history deleted");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-[#2a2a32] hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Toast feedback banner */}
      {toastMessage && (
        <div className="absolute top-16 right-6 z-50 bg-[#24242c] text-white text-xs px-3.5 py-1.5 rounded-xl shadow-2xl border border-[#383844] animate-in fade-in slide-in-from-top-2 duration-150">
          {toastMessage}
        </div>
      )}

      {/* Disappearing Messages Pill if enabled */}
      {activeConversation.disappearing_seconds > 0 && (
        <div className="bg-[#1b1b22] px-4 py-1 text-center text-xs text-signal-blue flex items-center justify-center gap-1.5 border-b border-[#26262e]">
          <Clock className="w-3.5 h-3.5" />
          <span>Disappearing messages enabled ({activeConversation.disappearing_seconds}s)</span>
        </div>
      )}

      {/* Message Feed Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {/* Intro Card for Note to Self (Screenshot 1) */}
        {isNoteToSelf && (
          <div className="max-w-md mx-auto my-6 p-7 rounded-3xl bg-[#1c1c20] border border-[#28282e] text-center flex flex-col items-center shadow-lg">
            <div className="w-14 h-14 rounded-full bg-[#dcdfe4] text-[#1c1c20] flex items-center justify-center mb-3">
              <FileText className="w-8 h-8 stroke-[2]" />
            </div>

            <div className="flex items-center gap-1.5 mb-2">
              <h4 className="text-base font-bold text-white">Note to Self</h4>
              <VerifiedBadge size="md" />
            </div>

            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#242436] text-signal-blue text-[11px] font-semibold mb-3">
              <VerifiedBadge size="sm" />
              <span>Official chat</span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
              You can add notes for yourself in this chat. If your account has any linked devices, new notes will be synced.
            </p>
          </div>
        )}

        {/* Date Divider (Clean centered text matching Screenshot 1) */}
        <div className="text-center my-4">
          <span className="text-xs text-gray-500 font-medium">Today</span>
        </div>

        {/* Messages List */}
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser?.id;
          const isSystem = msg.message_type === "system";
          const isHovered = hoveredMessageId === msg.id;

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center my-2">
                <span className="text-xs text-gray-500 px-3 py-1 bg-[#1a1a1f] rounded-full">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"} relative group`}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              {/* Floating Action Menu on hover */}
              {isHovered && (
                <div
                  className={`absolute top-0 -translate-y-8 z-20 flex items-center gap-1 bg-[#222226] border border-[#2f2f36] rounded-full px-2 py-0.5 shadow-xl ${
                    isMe ? "right-0" : "left-0"
                  }`}
                >
                  {EMOJIS.slice(0, 5).map((e) => (
                    <button
                      key={e}
                      onClick={() => toggleReaction(msg.id, e)}
                      className="text-xs p-1 hover:scale-125 transition-transform"
                    >
                      {e}
                    </button>
                  ))}
                  <button
                    onClick={() => setReplyingTo(msg)}
                    className="p-1 text-gray-400 hover:text-white transition-colors ml-1"
                    title="Reply"
                  >
                    <CornerUpLeft className="w-3 h-3" />
                  </button>
                  {isMe && (
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Message Bubble (Dynamic Chat Color from settings) */}
              <div
                className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm relative break-words shadow-xs ${
                  isMe
                    ? "text-white rounded-br-xs"
                    : "bg-[#28282e] text-white rounded-bl-xs"
                }`}
                style={{
                  backgroundColor: isMe ? (settings?.chatColor || "#2c6bed") : undefined,
                }}
              >
                {/* Quoted Reply */}
                {msg.reply_to && (
                  <div
                    className={`mb-1.5 px-2 py-1 rounded text-xs border-l-2 ${
                      isMe
                        ? "bg-black/20 border-white/80 text-white/90"
                        : "bg-black/30 border-signal-blue text-gray-300"
                    }`}
                  >
                    <span className="font-semibold block text-[10px] opacity-75">
                      {msg.reply_to.sender_name}
                    </span>
                    <span className="truncate block opacity-90">{msg.reply_to.content}</span>
                  </div>
                )}

                {/* Photo Attachment */}
                {msg.message_type === "image" && msg.file_url && (
                  <div className="mb-1 rounded-xl overflow-hidden cursor-pointer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        msg.file_url.startsWith("http")
                          ? msg.file_url
                          : `http://localhost:8000${msg.file_url}`
                      }
                      alt={msg.file_name || "Photo"}
                      className="max-h-72 w-auto object-contain rounded-xl hover:opacity-95 transition-opacity"
                      onClick={() =>
                        setLightboxImage(
                          msg.file_url!.startsWith("http")
                            ? msg.file_url!
                            : `http://localhost:8000${msg.file_url}`
                        )
                      }
                    />
                  </div>
                )}

                {/* Text Content */}
                <span className="leading-relaxed">{msg.content}</span>

                {/* Timestamp & Status Icon */}
                <span className="inline-flex items-center gap-1 float-right mt-1 ml-2 text-[10px] opacity-75 select-none">
                  <span>{formatMessageTime(msg.created_at)}</span>
                  {isMe && (
                    <span className="inline-flex">
                      {isNoteToSelf ? (
                        <LinkIcon className="w-3 h-3 text-blue-200" />
                      ) : settings && !settings.readReceipts ? (
                        <Check className="w-3.5 h-3.5 text-blue-200" />
                      ) : msg.status === "read" ? (
                        <CheckCheck className="w-3.5 h-3.5 text-white" />
                      ) : msg.status === "delivered" ? (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-200" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-blue-200" />
                      )}
                    </span>
                  )}
                </span>
              </div>

              {/* Reactions list */}
              {msg.reactions && msg.reactions.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {Array.from(new Set(msg.reactions.map((r: any) => r.emoji))).map((emoji: any) => (
                    <button
                      key={emoji}
                      onClick={() => toggleReaction(msg.id, emoji)}
                      className="px-2 py-0.5 rounded-full bg-[#202024] text-xs border border-[#2b2b32] text-gray-200 hover:scale-105"
                    >
                      {emoji} {msg.reactions.filter((r: any) => r.emoji === emoji).length}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Message Input Bar (Matching Screenshot 1) */}
      <footer className="p-4 bg-[#121214]">
        {/* Reply preview banner */}
        {replyingTo && (
          <div className="mb-2 p-2 rounded-xl bg-[#222226] border-l-4 border-signal-blue flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-signal-blue">
                Replying to {replyingTo.sender.display_name}
              </span>
              <p className="text-xs text-gray-400 truncate">{replyingTo.content}</p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* The Exact Signal Pill Input Bar */}
        <div className="w-full bg-[#222226] hover:bg-[#25252a] focus-within:bg-[#25252a] rounded-full px-4 py-2.5 flex items-center gap-3 transition-colors border border-transparent focus-within:border-[#383842]">
          {/* Smiley on Left */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Emoji"
            >
              <Smile className="w-5 h-5 stroke-[1.8]" />
            </button>

            {showEmojiPicker && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowEmojiPicker(false)}
                />
                <div className="absolute left-0 bottom-full mb-3 p-2.5 bg-[#222226] border border-[#2f2f36] rounded-2xl shadow-2xl grid grid-cols-4 gap-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => {
                        setInputContent((prev) => prev + e);
                        setShowEmojiPicker(false);
                      }}
                      className="text-xl p-1.5 hover:bg-[#2d2d35] rounded-lg transition-transform hover:scale-110"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Input text placeholder "Message" */}
          <input
            type="text"
            placeholder="Message"
            value={inputContent}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            spellCheck={settings?.spellCheck}
            className="bg-transparent text-white placeholder-gray-500 text-sm focus:outline-hidden flex-1 font-normal"
          />

          {/* Microphone on Right */}
          <button
            type="button"
            onClick={() => sendMessage("🎤 [Voice Note: 0:03]")}
            className="text-gray-400 hover:text-white transition-colors"
            title="Record Voice Note"
          >
            <Mic className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Plus icon on Far Right */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-white transition-colors"
            title="Attach file or photo"
          >
            <Plus className="w-5 h-5 stroke-[2]" />
          </button>
        </div>
      </footer>

      {/* Lightbox modal for photos */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md cursor-zoom-out"
          onClick={() => setLightboxImage(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage}
            alt="Lightbox view"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
