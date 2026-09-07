"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { User, Conversation, Message, Contact, UserBrief } from "@/types";
import { api } from "@/lib/api";
import { playIncomingSound, playOutgoingSound } from "@/lib/sound";

export interface AppSettings {
  // Appearance
  themeMode: "System" | "Dark" | "Light";
  chatColor: string;
  zoomLevel: string;
  language: string;

  // Chats
  useAddressBookPhotos: boolean;
  keepMutedArchived: boolean;
  spellCheck: boolean;
  showFormattingPopover: boolean;
  generateLinkPreviews: boolean;
  convertEmoticons: boolean;
  selectedSkinTone: number;
  chatFolders: { id: string; name: string }[];

  // Calls
  enableIncomingCalls: boolean;
  playCallingSounds: boolean;
  selectedVideoDevice: string;
  selectedMicDevice: string;
  selectedSpeakerDevice: string;
  alwaysRelayCalls: boolean;

  // Notifications
  enableNotifications: boolean;
  showCallNotifications: boolean;
  reactionNotifications: boolean;
  notificationContent: string;
  pushNotificationSounds: boolean;
  inChatMessageSounds: boolean;
  includeMutedInBadge: boolean;
  activeNotificationProfile: string;

  // Privacy
  readReceipts: boolean;
  typingIndicators: boolean;
  defaultDisappearingTimer: string;
  storiesEnabled: boolean;
  sealedSenderIcon: boolean;
  autoKeyVerification: boolean;
  blockedUsers: { id: string; name: string; username?: string }[];
  phonePrivacy: "everyone" | "nobody";

  // General
  deviceName: string;
  openAtLogin: boolean;
  micPermission: boolean;
  camPermission: boolean;

  // Data usage
  autoDownloadPhotos: boolean;
  autoDownloadVideo: boolean;
  autoDownloadAudio: boolean;
  autoDownloadDocs: boolean;
  sentMediaQuality: "Standard" | "High";

  // Backups
  backupPassphrase?: string;
  lastBackupDate?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: "Dark",
  chatColor: "#2c6bed",
  zoomLevel: "100%",
  language: "System Language",

  useAddressBookPhotos: false,
  keepMutedArchived: false,
  spellCheck: true,
  showFormattingPopover: true,
  generateLinkPreviews: true,
  convertEmoticons: true,
  selectedSkinTone: 0,
  chatFolders: [],

  enableIncomingCalls: true,
  playCallingSounds: true,
  selectedVideoDevice: "FaceTime HD Camera (C4E1:9BFB)",
  selectedMicDevice: "Default (Airdopes 161)",
  selectedSpeakerDevice: "Default (Airdopes 161)",
  alwaysRelayCalls: false,

  enableNotifications: true,
  showCallNotifications: true,
  reactionNotifications: true,
  notificationContent: "Name, content, and actions",
  pushNotificationSounds: false,
  inChatMessageSounds: true,
  includeMutedInBadge: false,
  activeNotificationProfile: "All Notifications",

  readReceipts: true,
  typingIndicators: true,
  defaultDisappearingTimer: "Off",
  storiesEnabled: true,
  sealedSenderIcon: false,
  autoKeyVerification: true,
  blockedUsers: [],
  phonePrivacy: "everyone",

  deviceName: "macOS",
  openAtLogin: false,
  micPermission: true,
  camPermission: true,

  autoDownloadPhotos: true,
  autoDownloadVideo: true,
  autoDownloadAudio: true,
  autoDownloadDocs: true,
  sentMediaQuality: "Standard",
};

interface SignalContextType {
  currentUser: User | null;
  seedUsers: UserBrief[];
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: "dark" | "light";
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  toggleTheme: () => void;
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  contacts: Contact[];
  onlineStatus: Record<string, { is_online: boolean; last_seen?: string }>;
  typingUsers: Record<string, string[]>; // conv_id -> list of user names typing
  setActiveConversationId: (id: string | null) => void;
  refreshConversations: () => Promise<void>;
  refreshContacts: () => Promise<void>;
  sendMessage: (content: string, replyToId?: string) => Promise<void>;
  sendAttachment: (file: File, replyToId?: string) => Promise<void>;
  sendTyping: (isTyping: boolean) => void;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  selectOrStartDirectChat: (contactUserId: string) => Promise<void>;
  createGroup: (name: string, memberIds: string[], avatarUrl?: string) => Promise<void>;
  addMemberToGroup: (convId: string, userId: string) => Promise<void>;
  removeMemberFromGroup: (convId: string, userId: string) => Promise<void>;
  updateDisappearingTimer: (convId: string, seconds: number) => Promise<void>;
  verifyOtpLogin: (identifier: string, otp: string, displayName?: string, avatarUrl?: string) => Promise<void>;
  switchUserAccount: (userId: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { display_name?: string; bio?: string; avatar_url?: string }) => Promise<void>;
}

const SignalContext = createContext<SignalContextType | undefined>(undefined);

export const SignalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [seedUsers, setSeedUsers] = useState<UserBrief[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [onlineStatus, setOnlineStatus] = useState<Record<string, { is_online: boolean; last_seen?: string }>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const pingIntervalRef = useRef<NodeJS.Timeout>();
  const typingTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Active conversation getter
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  // Load saved settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("signal_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
  }, []);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem("signal_settings", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save settings:", e);
      }
      return next;
    });
  }, []);

  // Synchronize Theme & Zoom with settings
  useEffect(() => {
    if (typeof document !== "undefined") {
      (document.documentElement.style as any).zoom = settings.zoomLevel || "100%";
    }

    const applyTheme = () => {
      const isDark =
        settings.themeMode === "Dark" ||
        (settings.themeMode === "System" &&
          typeof window !== "undefined" &&
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      if (isDark) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
        setTheme("dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
        setTheme("light");
      }
    };

    applyTheme();

    if (settings.themeMode === "System" && typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme();
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [settings.themeMode, settings.zoomLevel]);

  const toggleTheme = () => {
    const nextMode = theme === "dark" ? "Light" : "Dark";
    updateSetting("themeMode", nextMode);
  };

  const handleSetSoundEnabled = (val: boolean) => {
    setSoundEnabled(val);
    updateSetting("inChatMessageSounds", val);
  };

  // Initial Auth Check
  useEffect(() => {
    const initAuth = async () => {
      try {
        const seedList = await api.getSeedUsers();
        setSeedUsers(seedList);

        const token = localStorage.getItem("signal_token");
        let userLoaded = false;
        if (token) {
          try {
            const user = await api.getMe();
            setCurrentUser(user);
            userLoaded = true;
          } catch (e) {
            console.warn("Stored token expired or invalid, resetting:", e);
            api.removeToken();
          }
        }

        if (!userLoaded && seedList.length > 0) {
          // Default to Rishabh (or first seed user) for instant seamless experience matching the screenshots
          const defaultUser =
            seedList.find((u) => u.display_name?.toLowerCase().includes("rishabh")) ||
            seedList.find((u) => u.username === "alice") ||
            seedList[0];
          const switchRes = await api.switchUser(defaultUser.id);
          api.setToken(switchRes.access_token);
          setCurrentUser(switchRes.user);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // Fetch initial conversations and contacts when user logged in
  const refreshConversations = useCallback(async () => {
    if (!currentUser) return;
    try {
      const list = await api.getConversations();
      setConversations(list);
    } catch (e) {
      console.error("Error refreshing conversations:", e);
    }
  }, [currentUser]);

  const refreshContacts = useCallback(async () => {
    if (!currentUser) return;
    try {
      const list = await api.getContacts();
      setContacts(list);
    } catch (e) {
      console.error("Error refreshing contacts:", e);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      refreshConversations();
      refreshContacts();
    } else {
      setConversations([]);
      setMessages([]);
      setContacts([]);
    }
  }, [currentUser, refreshConversations, refreshContacts]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId || !currentUser) {
      setMessages([]);
      return;
    }

    const loadMsgs = async () => {
      try {
        const msgs = await api.getMessages(activeConversationId);
        setMessages(msgs);
        // Clear unread count for this conversation locally
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConversationId ? { ...c, unread_count: 0 } : c))
        );

        // Tell websocket manager this conversation is active
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              action: "active_conversation",
              conversation_id: activeConversationId,
            })
          );
        }
      } catch (e) {
        console.error("Error loading messages:", e);
      }
    };
    loadMsgs();
  }, [activeConversationId, currentUser]);

  // Set active conversation helper
  const setActiveConversationId = (id: string | null) => {
    setActiveConversationIdState(id);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          action: "active_conversation",
          conversation_id: id || "",
        })
      );
    }
  };

  // WebSocket Connection
  useEffect(() => {
    if (!currentUser) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.hostname}:8000/ws/${currentUser.id}`;

    const connectWs = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Signal Real-Time WebSocket connected.");
        // Notify active conversation if any
        if (activeConversationId) {
          ws.send(
            JSON.stringify({
              action: "active_conversation",
              conversation_id: activeConversationId,
            })
          );
        }

        // Heartbeat ping
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ action: "ping" }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (e) {
          console.error("WS parse error:", e);
        }
      };

      ws.onclose = () => {
        clearInterval(pingIntervalRef.current);
        // Reconnect after 2 seconds if still logged in
        reconnectTimeoutRef.current = setTimeout(() => {
          if (currentUser) {
            connectWs();
          }
        }, 2000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws.close();
      };
    };

    connectWs();

    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      clearInterval(pingIntervalRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [currentUser, activeConversationId]);

  // Handle incoming WebSocket events
  const handleWebSocketMessage = useCallback(
    (data: any) => {
      switch (data.type) {
        case "new_message": {
          const { conversation_id, message } = data;
          // Play sound if not sent by me
          if (message.sender_id !== currentUser?.id && soundEnabled) {
            playIncomingSound();
          }

          // If in active conversation, append message and mark as read
          if (conversation_id === activeConversationId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === message.id)) return prev;
              return [...prev, message];
            });
            // Send mark read
            api.markConversationRead(conversation_id).catch(() => {});
          }

          // Update conversation list item
          setConversations((prev) => {
            const foundIndex = prev.findIndex((c) => c.id === conversation_id);
            if (foundIndex !== -1) {
              const updatedConv = {
                ...prev[foundIndex],
                last_message: message,
                updated_at: message.created_at,
                unread_count:
                  conversation_id === activeConversationId || message.sender_id === currentUser?.id
                    ? 0
                    : prev[foundIndex].unread_count + 1,
              };
              const remaining = prev.filter((_, idx) => idx !== foundIndex);
              return [updatedConv, ...remaining];
            } else {
              // Fetch fresh conversations if unknown
              refreshConversations();
              return prev;
            }
          });
          break;
        }

        case "typing": {
          const { conversation_id, user_name, is_typing, user_id } = data;
          if (user_id === currentUser?.id) break;

          setTypingUsers((prev) => {
            const currentTypers = prev[conversation_id] || [];
            if (is_typing) {
              if (!currentTypers.includes(user_name)) {
                return { ...prev, [conversation_id]: [...currentTypers, user_name] };
              }
              return prev;
            } else {
              return {
                ...prev,
                [conversation_id]: currentTypers.filter((n) => n !== user_name),
              };
            }
          });

          // Auto clear typing after 4 seconds of inactivity
          const timerKey = `${conversation_id}_${user_id}`;
          if (typingTimeoutsRef.current[timerKey]) {
            clearTimeout(typingTimeoutsRef.current[timerKey]);
          }
          if (is_typing) {
            typingTimeoutsRef.current[timerKey] = setTimeout(() => {
              setTypingUsers((prev) => ({
                ...prev,
                [conversation_id]: (prev[conversation_id] || []).filter((n) => n !== user_name),
              }));
            }, 4000);
          }
          break;
        }

        case "messages_read": {
          const { conversation_id, message_ids } = data;
          if (conversation_id === activeConversationId) {
            setMessages((prev) =>
              prev.map((m) =>
                message_ids.includes(m.id) ? { ...m, status: "read" } : m
              )
            );
          }
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === conversation_id && c.last_message && message_ids.includes(c.last_message.id)) {
                return {
                  ...c,
                  last_message: { ...c.last_message, status: "read" },
                };
              }
              return c;
            })
          );
          break;
        }

        case "reaction_update": {
          const { message_id, reactions } = data;
          setMessages((prev) =>
            prev.map((m) => (m.id === message_id ? { ...m, reactions } : m))
          );
          break;
        }

        case "presence": {
          const { user_id, is_online, last_seen } = data;
          setOnlineStatus((prev) => ({
            ...prev,
            [user_id]: { is_online, last_seen },
          }));
          break;
        }

        case "message_deleted": {
          const { conversation_id, message_id } = data;
          if (conversation_id === activeConversationId) {
            setMessages((prev) => prev.filter((m) => m.id !== message_id));
          }
          refreshConversations();
          break;
        }

        case "disappearing_updated": {
          const { conversation_id, disappearing_seconds } = data;
          setConversations((prev) =>
            prev.map((c) =>
              c.id === conversation_id ? { ...c, disappearing_seconds } : c
            )
          );
          break;
        }

        case "group_updated":
        case "new_conversation": {
          refreshConversations();
          break;
        }

        default:
          break;
      }
    },
    [activeConversationId, currentUser, soundEnabled, refreshConversations]
  );

  // Send message
  const sendMessage = async (content: string, replyToId?: string) => {
    if (!activeConversationId || !content.trim()) return;
    try {
      if (soundEnabled) playOutgoingSound();
      const msg = await api.sendMessage(activeConversationId, {
        content: content.trim(),
        message_type: "text",
        reply_to_id: replyToId,
      });

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      // Update conversation in list
      setConversations((prev) => {
        const foundIndex = prev.findIndex((c) => c.id === activeConversationId);
        if (foundIndex !== -1) {
          const updated = {
            ...prev[foundIndex],
            last_message: msg,
            updated_at: msg.created_at,
          };
          return [updated, ...prev.filter((_, i) => i !== foundIndex)];
        }
        return prev;
      });
    } catch (e) {
      console.error("Error sending message:", e);
      throw e;
    }
  };

  // Send attachment (image, file)
  const sendAttachment = async (file: File, replyToId?: string) => {
    if (!activeConversationId) return;
    try {
      const uploadRes = await api.uploadFile(file);
      if (soundEnabled) playOutgoingSound();
      const msg = await api.sendMessage(activeConversationId, {
        content: file.name,
        message_type: uploadRes.message_type,
        file_url: uploadRes.file_url,
        file_name: uploadRes.file_name,
        file_size: uploadRes.file_size,
        reply_to_id: replyToId,
      });

      setMessages((prev) => [...prev, msg]);
      setConversations((prev) => {
        const found = prev.findIndex((c) => c.id === activeConversationId);
        if (found !== -1) {
          const updated = { ...prev[found], last_message: msg, updated_at: msg.created_at };
          return [updated, ...prev.filter((_, i) => i !== found)];
        }
        return prev;
      });
    } catch (e) {
      console.error("Error sending attachment:", e);
      throw e;
    }
  };

  // Send typing notification
  const sendTyping = (isTyping: boolean) => {
    if (!settings.typingIndicators) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && activeConversationId) {
      wsRef.current.send(
        JSON.stringify({
          action: "typing",
          conversation_id: activeConversationId,
          is_typing: isTyping,
        })
      );
    }
  };

  // Toggle reaction
  const toggleReaction = async (messageId: string, emoji: string) => {
    try {
      const res = await api.toggleReaction(messageId, emoji);
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions: res.reactions } : m))
      );
    } catch (e) {
      console.error("Error toggling reaction:", e);
      throw e;
    }
  };

  // Delete message
  const deleteMessage = async (messageId: string) => {
    try {
      await api.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      refreshConversations();
    } catch (e) {
      console.error("Error deleting message:", e);
      throw e;
    }
  };

  // Select or start direct chat with user
  const selectOrStartDirectChat = async (contactUserId: string) => {
    try {
      const conv = await api.createDirectConversation(contactUserId);
      await refreshConversations();
      setActiveConversationId(conv.id);
    } catch (e) {
      console.error("Error starting direct chat:", e);
      throw e;
    }
  };

  // Create new group
  const createGroup = async (name: string, memberIds: string[], avatarUrl?: string) => {
    try {
      const conv = await api.createGroupConversation(name, memberIds, avatarUrl);
      await refreshConversations();
      setActiveConversationId(conv.id);
    } catch (e) {
      console.error("Error creating group:", e);
      throw e;
    }
  };

  // Add member to group
  const addMemberToGroup = async (convId: string, userId: string) => {
    try {
      await api.addGroupMember(convId, userId);
      refreshConversations();
    } catch (e) {
      console.error("Error adding member:", e);
      throw e;
    }
  };

  // Remove member from group
  const removeMemberFromGroup = async (convId: string, userId: string) => {
    try {
      await api.removeGroupMember(convId, userId);
      refreshConversations();
    } catch (e) {
      console.error("Error removing member:", e);
      throw e;
    }
  };

  // Update disappearing message timer
  const updateDisappearingTimer = async (convId: string, seconds: number) => {
    try {
      await api.updateDisappearing(convId, seconds);
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, disappearing_seconds: seconds } : c))
      );
    } catch (e) {
      console.error("Error updating disappearing timer:", e);
      throw e;
    }
  };

  // Auth: Verify OTP login / register
  const verifyOtpLogin = async (identifier: string, otp: string, displayName?: string, avatarUrl?: string) => {
    try {
      const res = await api.verifyOtp(identifier, otp, displayName, avatarUrl);
      api.setToken(res.access_token);
      setCurrentUser(res.user);
      const seedList = await api.getSeedUsers();
      setSeedUsers(seedList);
    } catch (e) {
      console.error("Login error:", e);
      throw e;
    }
  };

  // Switch between seeded users for testing
  const switchUserAccount = async (userId: string) => {
    try {
      const res = await api.switchUser(userId);
      api.setToken(res.access_token);
      setCurrentUser(res.user);
      setActiveConversationId(null);
    } catch (e) {
      console.error("Switch account error:", e);
    }
  };

  // Logout
  const logout = () => {
    api.removeToken();
    setCurrentUser(null);
    setActiveConversationId(null);
  };

  // Update current user profile
  const updateProfile = async (data: { display_name?: string; bio?: string; avatar_url?: string }) => {
    try {
      const updated = await api.updateProfile(data);
      setCurrentUser(updated);
    } catch (e) {
      console.error("Profile update error:", e);
      throw e;
    }
  };

  return (
    <SignalContext.Provider
      value={{
        currentUser,
        seedUsers,
        isAuthenticated: !!currentUser,
        isLoading,
        theme,
        soundEnabled,
        setSoundEnabled: handleSetSoundEnabled,
        toggleTheme,
        settings,
        updateSetting,
        conversations,
        activeConversation,
        messages,
        contacts,
        onlineStatus,
        typingUsers,
        setActiveConversationId,
        refreshConversations,
        refreshContacts,
        sendMessage,
        sendAttachment,
        sendTyping,
        toggleReaction,
        deleteMessage,
        selectOrStartDirectChat,
        createGroup,
        addMemberToGroup,
        removeMemberFromGroup,
        updateDisappearingTimer,
        verifyOtpLogin,
        switchUserAccount,
        logout,
        updateProfile,
      }}
    >
      {children}
    </SignalContext.Provider>
  );
};

export const useSignal = () => {
  const context = useContext(SignalContext);
  if (!context) {
    throw new Error("useSignal must be used within a SignalProvider");
  }
  return context;
};
