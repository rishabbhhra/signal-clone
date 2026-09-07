"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Phone,
  Video,
  Info,
  Lock,
  Paperclip,
  Smile,
  Send,
  Check,
  CheckCheck,
  Clock,
  ArrowLeft,
  X,
  CornerUpLeft,
  Trash2,
  FileText,
  Download,
  Mic,
  MoreVertical,
} from "lucide-react";
import { useSignal } from "@/context/SignalContext";
import { Avatar } from "@/components/Avatar";
import { Message } from "@/types";
import { format, isToday, isYesterday } from "date-fns";

interface ChatPaneProps {
  onBackMobile: () => void;
  onToggleInfoDrawer: () => void;
  onStartCall: (isVideo: boolean) => void;
  onOpenSafetyNumber: (userId: string, name: string) => void;
}

const POPULAR_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "👏", "🔥", "🎉"];

export const ChatPane: React.FC<ChatPaneProps> = ({
  onBackMobile,
  onToggleInfoDrawer,
  onStartCall,
  onOpenSafetyNumber,
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
    typingUsers,
    onlineStatus,
  } = useSignal();

  const [inputContent, setInputContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  if (!activeConversation) {
    return (
      <div className="flex-1 h-full hidden md:flex flex-col items-center justify-center bg-gray-50 dark:bg-[#121214] text-center p-8 select-none">
        <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-[#1a1a1f] border border-blue-100 dark:border-gray-800 flex items-center justify-center text-signal-blue mb-4 shadow-sm">
          <Lock className="w-9 h-9" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Signal for Desktop
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm leading-relaxed">
          Select a conversation from the left to start private, end-to-end encrypted messaging.
        </p>
        <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#18181c] border border-gray-200 dark:border-gray-800 text-xs text-gray-500 shadow-xs">
          <Lock className="w-3.5 h-3.5 text-signal-blue" />
          <span>Simulated End-to-End Encryption</span>
        </div>
      </div>
    );
  }

  const isGroup = activeConversation.type === "group";
  const directUser = activeConversation.direct_recipient;
  const chatTitle = isGroup ? activeConversation.name : directUser?.display_name || "Contact";
  const chatAvatar = isGroup ? activeConversation.avatar_url : directUser?.avatar_url;

  // Live presence
  const isDirectOnline =
    !isGroup && directUser
      ? (onlineStatus[directUser.id]?.is_online ?? directUser.is_online)
      : false;

  // Current typers for this chat
  const typers = typingUsers[activeConversation.id] || [];
  const isTyping = typers.length > 0;

  // Format message status
  const formatTime = (iso: string) => {
    try {
      return format(new Date(iso), "h:mm a");
    } catch {
      return "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputContent(e.target.value);

    // Send typing event
    sendTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!inputContent.trim()) return;
    const content = inputContent.trim();
    setInputContent("");
    sendTyping(false);
    const replyId = replyingTo ? replyingTo.id : undefined;
    setReplyingTo(null);
    try {
      await sendMessage(content, replyId);
    } catch (e) {
      console.error(e);
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

  // Group messages by date
  const renderDateSeparator = (currDate: string, prevDate?: string) => {
    const curr = new Date(currDate);
    if (!prevDate) {
      return (
        <div className="flex justify-center my-4">
          <span className="px-3 py-1 rounded-full bg-gray-200/70 dark:bg-[#202025] text-[11px] font-medium text-gray-600 dark:text-gray-400 shadow-2xs">
            {isToday(curr) ? "Today" : isYesterday(curr) ? "Yesterday" : format(curr, "MMMM d, yyyy")}
          </span>
        </div>
      );
    }
    const prev = new Date(prevDate);
    if (curr.toDateString() !== prev.toDateString()) {
      return (
        <div className="flex justify-center my-4">
          <span className="px-3 py-1 rounded-full bg-gray-200/70 dark:bg-[#202025] text-[11px] font-medium text-gray-600 dark:text-gray-400 shadow-2xs">
            {isToday(curr) ? "Today" : isYesterday(curr) ? "Yesterday" : format(curr, "MMMM d, yyyy")}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="flex-1 h-full flex flex-col bg-gray-50/50 dark:bg-[#121214] relative overflow-hidden">
      {/* Top Chat Header */}
      <header className="h-16 px-4 py-2 bg-white dark:bg-[#1a1a1e] border-b border-gray-200 dark:border-[#28282e] flex items-center justify-between z-10 select-none">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button on mobile */}
          <button
            onClick={onBackMobile}
            className="md:hidden p-1.5 -ml-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div
            onClick={onToggleInfoDrawer}
            className="flex items-center gap-3 cursor-pointer group min-w-0"
          >
            <Avatar
              name={chatTitle || "Chat"}
              url={chatAvatar}
              size="sm"
              isOnline={isDirectOnline}
              showOnlineBadge={!isGroup}
            />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-signal-blue transition-colors">
                {chatTitle}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {isTyping ? (
                  <span className="text-signal-blue font-medium animate-pulse">
                    {typers.join(", ")} is typing...
                  </span>
                ) : isGroup ? (
                  `${activeConversation.participants.length} members`
                ) : isDirectOnline ? (
                  <span className="text-emerald-500 font-medium">Online</span>
                ) : (
                  "Offline"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
          {/* Safety Number Button */}
          {!isGroup && directUser && (
            <button
              onClick={() => onOpenSafetyNumber(directUser.id, directUser.display_name)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#25252a] text-signal-blue transition-colors"
              title="Verify End-to-End Encryption"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          {/* Audio Call */}
          <button
            onClick={() => onStartCall(false)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#25252a] hover:text-signal-blue transition-colors"
            title="Start Voice Call"
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* Video Call */}
          <button
            onClick={() => onStartCall(true)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#25252a] hover:text-signal-blue transition-colors"
            title="Start Video Call"
          >
            <Video className="w-4 h-4" />
          </button>

          {/* Chat / Group Info */}
          <button
            onClick={onToggleInfoDrawer}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#25252a] hover:text-signal-blue transition-colors"
            title="Conversation Details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Disappearing messages banner */}
      {activeConversation.disappearing_seconds > 0 && (
        <div className="bg-blue-50/80 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/30 px-4 py-1.5 text-center text-xs text-signal-blue flex items-center justify-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>
            Disappearing messages are enabled. Messages disappear after{" "}
            {activeConversation.disappearing_seconds < 60
              ? `${activeConversation.disappearing_seconds} seconds`
              : activeConversation.disappearing_seconds < 3600
              ? `${activeConversation.disappearing_seconds / 60}m`
              : `${activeConversation.disappearing_seconds / 3600}h`}
            .
          </span>
        </div>
      )}

      {/* Message Feed Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, index) => {
          const prevMsg = index > 0 ? messages[index - 1] : undefined;
          const isMe = msg.sender_id === currentUser?.id;
          const isSystem = msg.message_type === "system";
          const isHovered = hoveredMessageId === msg.id;

          // Consecutive grouping check
          const isSameSender = prevMsg && prevMsg.sender_id === msg.sender_id && !isSystem;

          if (isSystem) {
            return (
              <React.Fragment key={msg.id}>
                {renderDateSeparator(msg.created_at, prevMsg?.created_at)}
                <div className="flex justify-center my-3">
                  <span className="px-3.5 py-1 rounded-full bg-gray-200/70 dark:bg-[#202025] text-[11px] text-gray-500 dark:text-gray-400">
                    {msg.content}
                  </span>
                </div>
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={msg.id}>
              {renderDateSeparator(msg.created_at, prevMsg?.created_at)}

              <div
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${
                  isSameSender ? "mt-1" : "mt-3"
                } relative group`}
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                {/* Group message sender header */}
                {isGroup && !isMe && !isSameSender && (
                  <span className="text-[11px] font-semibold text-signal-blue mb-1 ml-2">
                    {msg.sender.display_name}
                  </span>
                )}

                {/* Bubble Container */}
                <div className="relative max-w-[82%] md:max-w-[70%]">
                  {/* Floating Action Menu on hover */}
                  {isHovered && (
                    <div
                      className={`absolute top-0 -translate-y-9 z-20 flex items-center gap-0.5 bg-white dark:bg-[#1f1f24] rounded-full px-2 py-1 shadow-lg border border-gray-200 dark:border-gray-700 animate-in fade-in duration-100 ${
                        isMe ? "right-0" : "left-0"
                      }`}
                    >
                      {/* Emoji quick reactions */}
                      {POPULAR_EMOJIS.slice(0, 5).map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => toggleReaction(msg.id, emoji)}
                          className="p-1 hover:scale-125 transition-transform text-sm"
                        >
                          {emoji}
                        </button>
                      ))}

                      <div className="w-[1px] h-3.5 bg-gray-300 dark:bg-gray-700 mx-1" />

                      {/* Reply button */}
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="p-1 text-gray-500 hover:text-signal-blue transition-colors"
                        title="Reply"
                      >
                        <CornerUpLeft className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button (if my message) */}
                      {isMe && (
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm break-words relative shadow-2xs ${
                      isMe
                        ? "bg-signal-blue text-white rounded-br-xs"
                        : "bg-gray-200 dark:bg-[#2b2b32] text-gray-900 dark:text-gray-100 rounded-bl-xs"
                    }`}
                  >
                    {/* Quoted Reply snippet */}
                    {msg.reply_to && (
                      <div
                        className={`mb-2 px-2.5 py-1.5 rounded-lg text-xs border-l-3 ${
                          isMe
                            ? "bg-black/15 border-white/70 text-white/90"
                            : "bg-black/5 dark:bg-black/20 border-signal-blue text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <span className="font-semibold block text-[10px] opacity-80">
                          {msg.reply_to.sender_name}
                        </span>
                        <span className="truncate block opacity-90">
                          {msg.reply_to.content}
                        </span>
                      </div>
                    )}

                    {/* Image Attachment */}
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

                    {/* File Attachment */}
                    {msg.message_type === "file" && msg.file_url && (
                      <a
                        href={
                          msg.file_url.startsWith("http")
                            ? msg.file_url
                            : `http://localhost:8000${msg.file_url}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center gap-3 p-2 rounded-xl mb-1 ${
                          isMe ? "bg-black/20" : "bg-black/5 dark:bg-black/20"
                        }`}
                      >
                        <FileText className="w-8 h-8 opacity-80" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs truncate">
                            {msg.file_name || "Attachment"}
                          </div>
                          {msg.file_size && (
                            <div className="text-[10px] opacity-70">
                              {(msg.file_size / 1024).toFixed(1)} KB
                            </div>
                          )}
                        </div>
                        <Download className="w-4 h-4 opacity-80" />
                      </a>
                    )}

                    {/* Text content */}
                    {msg.content && <p className="leading-relaxed">{msg.content}</p>}

                    {/* Message Footer: Timestamp and Status */}
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
                        isMe ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <span>{formatTime(msg.created_at)}</span>

                      {/* Checkmarks for outgoing */}
                      {isMe && (
                        <span className="inline-flex">
                          {msg.status === "read" ? (
                            <CheckCheck className="w-3.5 h-3.5 text-white" />
                          ) : msg.status === "delivered" ? (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-200" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-blue-200" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reaction Badges attached to bottom edge */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div
                      className={`flex flex-wrap gap-1 mt-1 ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Group reactions by emoji */}
                      {Array.from(new Set(msg.reactions.map((r) => r.emoji))).map((emoji) => {
                        const count = msg.reactions.filter((r) => r.emoji === emoji).length;
                        const reactedByMe = msg.reactions.some(
                          (r) => r.emoji === emoji && r.user_id === currentUser?.id
                        );
                        return (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(msg.id, emoji)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs shadow-xs border transition-all ${
                              reactedByMe
                                ? "bg-blue-50 dark:bg-blue-900/40 border-signal-blue text-signal-blue"
                                : "bg-white dark:bg-[#1e1e23] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            <span>{emoji}</span>
                            {count > 1 && <span className="font-semibold text-[10px]">{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* Animated Typing Indicator Bubble */}
        {isTyping && (
          <div className="flex items-center gap-2 mt-2">
            <div className="px-4 py-3 rounded-2xl bg-gray-200 dark:bg-[#2b2b32] rounded-bl-xs flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" />
              <span
                className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Message Input Bar */}
      <footer className="p-3 bg-white dark:bg-[#1a1a1e] border-t border-gray-200 dark:border-[#28282e] z-10">
        {/* Quoted Message preview bar */}
        {replyingTo && (
          <div className="mb-2 p-2.5 rounded-xl bg-gray-100 dark:bg-[#25252a] border-l-4 border-signal-blue flex items-center justify-between animate-in slide-in-from-bottom-2 duration-100">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-signal-blue">
                Replying to {replyingTo.sender.display_name}
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                {replyingTo.content || "[Attachment]"}
              </p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* File attachment button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full text-gray-500 hover:text-signal-blue hover:bg-gray-100 dark:hover:bg-[#25252a] transition-colors"
            title="Add attachment"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Textarea Input */}
          <div className="flex-1 relative flex items-center">
            <textarea
              value={inputContent}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Signal message..."
              rows={1}
              className="w-full px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-[#141417] text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 border border-transparent focus:border-signal-blue/60 focus:bg-transparent focus:outline-hidden resize-none max-h-32 transition-all leading-snug"
            />

            {/* Emoji popover trigger */}
            <div className="absolute right-2.5 bottom-2.5">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-400 hover:text-signal-blue transition-colors"
              >
                <Smile className="w-5 h-5" />
              </button>

              {showEmojiPicker && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowEmojiPicker(false)}
                  />
                  <div className="absolute right-0 bottom-full mb-2 p-3 bg-white dark:bg-[#202025] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 grid grid-cols-4 gap-2 z-40 animate-in fade-in zoom-in-95 duration-100">
                    {POPULAR_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setInputContent((prev) => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="text-xl p-1.5 hover:bg-gray-100 dark:hover:bg-[#2a2a30] rounded-lg transition-transform active:scale-95"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Send or Mic Button */}
          {inputContent.trim() ? (
            <button
              type="button"
              onClick={handleSend}
              className="p-2.5 rounded-full bg-signal-blue hover:bg-signal-blue-hover text-white transition-all shadow-md active:scale-95 flex-shrink-0"
              title="Send Message"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                sendMessage("🎤 [Voice message simulation: 0:04]");
              }}
              className="p-2.5 rounded-full text-gray-500 hover:text-signal-blue hover:bg-gray-100 dark:hover:bg-[#25252a] transition-colors"
              title="Send Voice Note"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </footer>

      {/* Lightbox image preview modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setLightboxImage(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage}
            alt="Enlarged view"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </section>
  );
};
