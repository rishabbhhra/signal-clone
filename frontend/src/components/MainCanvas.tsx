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
  Send,
} from "lucide-react";
import { RailTab } from "./ActivityRail";
import { SettingsSection } from "./SubSidebar";
import { SettingsViews } from "./SettingsViews";
import { useSignal } from "@/context/SignalContext";
import { VerifiedBadge } from "./VerifiedBadge";
import { Avatar } from "./Avatar";
import { format, isToday, isYesterday } from "date-fns";
import { PollModal } from "./Modals/PollModal";
import { EmojiStickerPicker } from "./EmojiStickerPicker";
import { VoiceMessagePlayer } from "./VoiceMessagePlayer";
import { PollCard } from "./PollCard";

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

  // Attachment menu & Poll state (Screenshot media_1788808987693.png)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const photoVideoInputRef = useRef<HTMLInputElement | null>(null);

  // Audio Recording State (Real browser MediaRecorder)
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Real Audio Recording Handlers
  const startRecordingAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(100);
      setIsRecordingAudio(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Audio recording permission error:", err);
      showToast("Microphone access denied or not available");
    }
  };

  const cancelRecordingAudio = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }
    setIsRecordingAudio(false);
    setRecordingDuration(0);
    audioChunksRef.current = [];
  };

  const stopAndSendAudio = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.onstop = async () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
        audioStreamRef.current = null;
      }
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      if (audioBlob.size > 0) {
        const audioFile = new File([audioBlob], `voice-note-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        try {
          await sendAttachment(audioFile, replyingTo ? replyingTo.id : undefined);
          setReplyingTo(null);
        } catch (e) {
          console.error("Failed to send voice note:", e);
          showToast("Failed to send voice note");
        }
      }
      setIsRecordingAudio(false);
      setRecordingDuration(0);
      audioChunksRef.current = [];
    };

    if (mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const formatAudioSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder.toString().padStart(2, "0")}`;
  };

  const handleCreatePoll = async (pollData: {
    question: string;
    options: string[];
    allowMultiple: boolean;
  }) => {
    try {
      const pollPayload = {
        type: "poll",
        question: pollData.question,
        options: pollData.options.map((opt) => ({ text: opt })),
        allowMultiple: pollData.allowMultiple,
      };
      await sendMessage(JSON.stringify(pollPayload), replyingTo ? replyingTo.id : undefined);
      setReplyingTo(null);
      showToast("Poll sent");
    } catch (e) {
      console.error("Failed to create poll:", e);
      showToast("Failed to create poll");
    }
  };

  const handleSendMedia = async (url: string, type: "sticker" | "gif" | "image") => {
    try {
      await sendMessage(url, replyingTo ? replyingTo.id : undefined);
      setReplyingTo(null);
    } catch (e) {
      console.error("Failed to send media:", e);
    }
  };

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
      <div className="flex-1 h-full bg-[#111113] flex flex-col items-center justify-center text-center p-8 select-none">
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
      <div className="flex-1 h-full bg-[#111113] flex flex-col items-center justify-center text-center p-8 select-none">
        <div
          onClick={onOpenAddStory}
          className="w-16 h-16 rounded-full flex items-center justify-center text-gray-500 hover:text-white cursor-pointer transition-transform hover:scale-105 mb-4"
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="w-6 h-8 rounded-sm border-2 border-current rotate-6 absolute -right-0.5 opacity-50" />
            <div className="w-6 h-8 rounded-sm border-2 border-current -rotate-3 bg-[#111113] relative z-10" />
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
      <div className="flex-1 h-full bg-[#111113] flex flex-col items-center justify-center text-center p-8 select-none">
        <div className="w-16 h-16 rounded-full bg-[#28282c] flex items-center justify-center text-signal-blue mb-4">
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
    <div className="flex-1 h-full bg-[#111113] flex flex-col relative overflow-hidden select-none">
      {/* Top Header (Matching Screenshot 1) */}
      <header className="h-14 px-4 bg-[#111113] border-b border-[#28282c] flex items-center justify-between z-10">
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
        {/* Intro Card for Note to Self (Screenshot media_1788808797489.png) */}
        {isNoteToSelf && (
          <div className="relative mt-12 mb-6 pt-11 pb-7 px-8 rounded-[30px] bg-[#222225] border border-[#2e2e34] max-w-sm mx-auto text-center flex flex-col items-center shadow-lg">
            {/* Overhanging Icon Circle */}
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 w-[72px] h-[72px] rounded-full bg-[#cfd2d8] flex items-center justify-center border-4 border-[#111113] shadow-sm">
              <svg
                width="34"
                height="38"
                viewBox="0 0 24 28"
                fill="none"
                stroke="#36383e"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="2" width="18" height="24" rx="4" />
                <line x1="7" y1="8" x2="17" y2="8" />
                <line x1="7" y1="12" x2="17" y2="12" />
                <line x1="7" y1="16" x2="17" y2="16" />
              </svg>
            </div>

            <div className="flex items-center justify-center gap-1.5 mb-2">
              <h4 className="text-base font-bold text-white tracking-tight">Note to Self</h4>
              <VerifiedBadge size="md" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#272d4b] text-[#9db2ff] text-xs font-semibold mb-3.5 shadow-xs">
              <VerifiedBadge size="sm" />
              <span>Official chat</span>
            </div>

            <p className="text-sm text-[#d4d4dc] leading-relaxed max-w-[270px] font-normal">
              You can add notes for yourself in this chat. If your account has any linked devices, new notes will be synced.
            </p>
          </div>
        )}

        {/* Date Divider (Clean centered text matching Screenshot media_1788808797489.png) */}
        <div className="text-center my-4">
          <span className="text-xs text-[#787880] font-normal">Yesterday</span>
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

                {/* Poll Message */}
                {(msg.message_type === "poll" || (msg.content && msg.content.startsWith('{"type":"poll"'))) ? (
                  (() => {
                    try {
                      const pollData = JSON.parse(msg.content);
                      return (
                        <PollCard
                          pollData={pollData}
                          reactions={msg.reactions}
                          currentUserId={currentUser?.id}
                          onVote={(idx) => toggleReaction(msg.id, `vote:${idx}`)}
                          isMe={isMe}
                        />
                      );
                    } catch {
                      return <span className="leading-relaxed">{msg.content}</span>;
                    }
                  })()
                ) : (msg.message_type === "voice" || (msg.file_url && (msg.file_url.endsWith(".webm") || msg.file_url.endsWith(".ogg") || msg.file_url.endsWith(".mp3") || msg.file_url.endsWith(".wav")))) ? (
                  /* Voice Note Message */
                  <VoiceMessagePlayer audioUrl={msg.file_url || ""} isMe={isMe} />
                ) : (msg.message_type === "image" && msg.file_url) || (msg.content && msg.content.startsWith("http") && (msg.content.includes("giphy.gif") || msg.content.includes("unsplash.com"))) ? (
                  /* Photo / Sticker / GIF Attachment */
                  <div className="mb-1 rounded-xl overflow-hidden cursor-pointer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        msg.file_url
                          ? msg.file_url.startsWith("http")
                            ? msg.file_url
                            : `http://localhost:8000${msg.file_url}`
                          : msg.content
                      }
                      alt={msg.file_name || "Media"}
                      className="max-h-72 w-auto object-contain rounded-xl hover:opacity-95 transition-opacity"
                      onClick={() =>
                        setLightboxImage(
                          msg.file_url
                            ? msg.file_url.startsWith("http")
                              ? msg.file_url
                              : `http://localhost:8000${msg.file_url}`
                            : msg.content
                        )
                      }
                    />
                  </div>
                ) : msg.message_type === "file" && msg.file_url ? (
                  /* File Document Attachment */
                  <a
                    href={
                      msg.file_url.startsWith("http")
                        ? msg.file_url
                        : `http://localhost:8000${msg.file_url}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-black/20 hover:bg-black/30 transition-colors my-1"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate">{msg.file_name || "Attachment"}</p>
                      <p className="text-[10px] opacity-75">
                        {msg.file_size ? `${Math.round(msg.file_size / 1024)} KB` : "Document"}
                      </p>
                    </div>
                    <Download className="w-4 h-4 opacity-75 hover:opacity-100 flex-shrink-0" />
                  </a>
                ) : (
                  /* Text Content */
                  <span className="leading-relaxed">{msg.content}</span>
                )}

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

      {/* Bottom Message Input Bar (Matching Screenshot media_1788808987693.png & media_1788808987694.png) */}
      <footer className="p-3.5 bg-[#111113] relative">
        {/* Reply preview banner */}
        {replyingTo && (
          <div className="mb-2 p-2.5 rounded-2xl bg-[#28282c] border-l-4 border-signal-blue flex items-center justify-between shadow-md">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-signal-blue">
                Replying to {replyingTo.sender?.display_name || "Contact"}
              </span>
              <p className="text-xs text-gray-300 truncate">{replyingTo.content}</p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Audio Recording State or Normal Input Pill */}
        {isRecordingAudio ? (
          <div className="w-full bg-[#28282c] rounded-full px-5 py-2.5 flex items-center justify-between border border-red-500/40 shadow-xl animate-in fade-in duration-100 select-none">
            {/* Pulsing indicator & timer */}
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse ring-4 ring-red-500/20" />
              <span className="text-xs font-semibold text-red-400 tracking-wide uppercase">Recording</span>
              <span className="text-sm font-mono text-white font-medium">{formatAudioSeconds(recordingDuration)}</span>

              {/* Animated waveform bars */}
              <div className="flex items-center gap-1 h-5 ml-2">
                {[30, 75, 45, 90, 60, 100, 70, 40, 85, 55, 95, 65].map((h, idx) => (
                  <div
                    key={idx}
                    style={{ height: `${h}%` }}
                    className="w-1 bg-red-400/80 rounded-full animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Cancel & Send controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecordingAudio}
                className="p-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors"
                title="Discard voice note"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
              <button
                type="button"
                onClick={stopAndSendAudio}
                className="w-9 h-9 rounded-full bg-signal-blue hover:bg-blue-600 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
                title="Send voice note"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full bg-[#28282c] hover:bg-[#2c2c30] focus-within:bg-[#2c2c30] rounded-full px-3.5 py-2 flex items-center gap-2.5 transition-colors border border-[#38383c]/60 shadow-xs relative">
            {/* 1. Emoji / Stickers / GIFs Popover Button */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-1 rounded-full transition-colors ${
                  showEmojiPicker ? "text-white bg-[#3e3e44]" : "text-gray-400 hover:text-white"
                }`}
                title="Emoji & Stickers"
              >
                <Smile className="w-5 h-5 stroke-[1.8]" />
              </button>

              <EmojiStickerPicker
                isOpen={showEmojiPicker}
                onClose={() => setShowEmojiPicker(false)}
                onSelectEmoji={(emoji) => setInputContent((prev) => prev + emoji)}
                onSelectMedia={handleSendMedia}
              />
            </div>

            {/* 2. Text Input placeholder "Message" */}
            <input
              type="text"
              placeholder="Message"
              value={inputContent}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              spellCheck={settings?.spellCheck}
              className="bg-transparent text-white placeholder-gray-400 text-sm focus:outline-hidden flex-1 font-normal py-0.5"
            />

            {/* 3. Microphone Button on Right */}
            <button
              type="button"
              onClick={startRecordingAudio}
              className="p-1 text-gray-400 hover:text-white transition-colors flex-shrink-0"
              title="Record Voice Note"
            >
              <Mic className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* 4. Attachment '+' Button with Popover (Screenshot media_1788808987693.png) */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  showAttachmentMenu
                    ? "bg-[#3e3e44] text-white rotate-45"
                    : "bg-[#323236] text-white hover:bg-[#3d3d42]"
                }`}
                title="Add attachment"
              >
                <Plus className="w-4.5 h-4.5 stroke-[2.2]" />
              </button>

              {/* Floating Menu anchored above '+' */}
              {showAttachmentMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowAttachmentMenu(false)}
                  />
                  <div className="absolute right-0 bottom-full mb-3 bg-[#2b2b2e] border border-[#38383c]/70 rounded-2xl p-1.5 shadow-2xl min-w-[195px] z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5 select-none">
                    {/* Photos & videos */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowAttachmentMenu(false);
                        photoVideoInputRef.current?.click();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#38383e] text-white text-sm font-normal transition-colors text-left"
                    >
                      <ImageIcon className="w-4.5 h-4.5 stroke-[1.8] flex-shrink-0" />
                      <span>Photos & videos</span>
                    </button>

                    {/* File */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowAttachmentMenu(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#38383e] text-white text-sm font-normal transition-colors text-left"
                    >
                      <FileText className="w-4.5 h-4.5 stroke-[1.8] flex-shrink-0" />
                      <span>File</span>
                    </button>

                    {/* Poll */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowAttachmentMenu(false);
                        setIsPollModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#38383e] text-white text-sm font-normal transition-colors text-left"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="flex-shrink-0"
                      >
                        <rect x="3" y="4" width="18" height="3.5" rx="1.75" />
                        <rect x="3" y="10.25" width="18" height="3.5" rx="1.75" />
                        <rect x="3" y="16.5" width="18" height="3.5" rx="1.75" />
                      </svg>
                      <span>Poll</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={photoVideoInputRef}
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="*/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}
      </footer>

      {/* Poll Creation Modal */}
      <PollModal
        isOpen={isPollModalOpen}
        onClose={() => setIsPollModalOpen(false)}
        onCreatePoll={handleCreatePoll}
      />

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
