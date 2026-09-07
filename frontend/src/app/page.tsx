"use client";

import React, { useState, useEffect } from "react";
import { useSignal } from "@/context/SignalContext";
import { ActivityRail, RailTab } from "@/components/ActivityRail";
import { SubSidebar, SettingsSection } from "@/components/SubSidebar";
import { MainCanvas } from "@/components/MainCanvas";
import { GroupInfoDrawer } from "@/components/GroupInfoDrawer";
import { AuthScreen } from "@/components/AuthScreen";
import { NewChatModal } from "@/components/Modals/NewChatModal";
import { NewGroupModal } from "@/components/Modals/NewGroupModal";
import { SafetyNumberModal } from "@/components/Modals/SafetyNumberModal";
import { CallModal } from "@/components/Modals/CallModal";
import { CallLinkModal } from "@/components/Modals/CallLinkModal";
import { StoryCreatorModal } from "@/components/Modals/StoryCreatorModal";
import { LinkedDevicesModal } from "@/components/Modals/LinkedDevicesModal";
import { Lock } from "lucide-react";

export default function Home() {
  const {
    currentUser,
    isLoading,
    conversations,
    activeConversation,
    setActiveConversationId,
  } = useSignal();

  // Active navigation tabs
  const [activeRailTab, setActiveRailTab] = useState<RailTab>("chats");
  const [activeSettingsSection, setActiveSettingsSection] = useState<SettingsSection>("general");
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  // Mobile: tracks whether we're showing the chat panel (vs the list panel)
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);


  // Modals
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isCallLinkOpen, setIsCallLinkOpen] = useState(false);
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState(false);
  const [isLinkedDevicesOpen, setIsLinkedDevicesOpen] = useState(false);
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);

  // Safety number target
  const [safetyNumberTarget, setSafetyNumberTarget] = useState<{
    userId: string;
    name: string;
  } | null>(null);

  // Call modal
  const [activeCall, setActiveCall] = useState<{
    isVideo: boolean;
    contactName: string;
    avatarUrl?: string | null;
  } | null>(null);

  // Auto-select Note to Self by default if no active conversation is set
  useEffect(() => {
    if (!activeConversation && conversations.length > 0) {
      const noteToSelf = conversations.find((c) => c.type === "note_to_self") || conversations[0];
      if (noteToSelf) {
        setActiveConversationId(noteToSelf.id);
      }
    }
  }, [conversations, activeConversation, setActiveConversationId]);

  // On mobile: auto-show chat panel when a conversation is selected
  useEffect(() => {
    if (activeConversation) {
      setIsMobileChatOpen(true);
    }
  }, [activeConversation?.id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsNewChatOpen(true);
      }
      if (e.key === "Escape") {
        setIsNewChatOpen(false);
        setIsNewGroupOpen(false);
        setIsCallLinkOpen(false);
        setIsStoryCreatorOpen(false);
        setIsLinkedDevicesOpen(false);
        setSafetyNumberTarget(null);
        setActiveCall(null);
        setIsInfoDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#111113] text-white">
        <div className="w-16 h-16 rounded-2xl bg-signal-blue flex items-center justify-center animate-pulse mb-4 shadow-lg shadow-blue-500/30">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Signal</h2>
        <p className="text-xs text-gray-500 mt-1 font-mono">Loading secure messenger...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  const handleStartCall = (isVideo: boolean) => {
    if (!activeConversation) return;
    const isGroup = activeConversation.type === "group";
    const name = isGroup
      ? activeConversation.name || "Group"
      : activeConversation.direct_recipient?.display_name || "Contact";
    const avatar = isGroup
      ? activeConversation.avatar_url
      : activeConversation.direct_recipient?.avatar_url;

    setActiveCall({
      isVideo,
      contactName: name,
      avatarUrl: avatar,
    });
  };

  const handleOpenSafetyNumber = (userId: string, name: string) => {
    setSafetyNumberTarget({ userId, name });
  };

  const unreadCount = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  return (
    <main className="h-screen w-screen flex overflow-hidden bg-[#111113] text-white font-sans select-none">

      {/* 1. Activity Rail — hidden on mobile, shown on md+ */}
      <div className="hidden md:flex">
        <ActivityRail
          activeTab={activeRailTab}
          onSelectTab={(tab) => {
            setActiveRailTab(tab);
            setIsMobileChatOpen(false); // go back to list on mobile when switching tabs
            if (tab === "settings") {
              setActiveSettingsSection("general");
            }
          }}
          unreadChatsCount={unreadCount}
          onToggleSidebar={() => setIsSidebarVisible((v) => !v)}
        />
      </div>

      {/* 2. Left Panel: Activity Rail (mobile bottom) + SubSidebar
              Mobile: full screen when !isMobileChatOpen, hidden when isMobileChatOpen
              md+: always visible (if isSidebarVisible) */}
      <div className={`
        flex flex-col md:flex-row h-full
        ${isMobileChatOpen ? "hidden md:flex" : "flex w-full md:w-auto"}
      `}>
        {/* Mobile-only bottom nav bar (replaces activity rail) */}
        <div className="md:hidden flex items-center justify-around border-b border-[#222226] bg-[#161618] px-2 py-2 flex-shrink-0">
          {([
            { id: "chats", icon: "💬", label: "Chats" },
            { id: "calls", icon: "📞", label: "Calls" },
            { id: "stories", icon: "◉", label: "Stories" },
            { id: "settings", icon: "⚙️", label: "Settings" },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveRailTab(tab.id);
                if (tab.id === "settings") setActiveSettingsSection("general");
              }}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors ${
                activeRailTab === tab.id ? "text-white" : "text-gray-500"
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* SubSidebar */}
        {isSidebarVisible && (
          <SubSidebar
            activeRailTab={activeRailTab}
            activeSettingsSection={activeSettingsSection}
            onSelectSettingsSection={(sec) => setActiveSettingsSection(sec)}
            onOpenCompose={() => setIsNewChatOpen(true)}
            onOpenNewGroup={() => setIsNewGroupOpen(true)}
            onCreateCallLink={() => setIsCallLinkOpen(true)}
            onOpenAddStory={() => setIsStoryCreatorOpen(true)}
          />
        )}
      </div>

      {/* 3. Main Canvas — hidden on mobile when !isMobileChatOpen, full screen when open */}
      <div className={`
        flex-1 h-full flex overflow-hidden
        ${!isMobileChatOpen ? "hidden md:flex" : "flex w-full"}
      `}>
        <MainCanvas
          activeRailTab={activeRailTab}
          activeSettingsSection={activeSettingsSection}
          onOpenSafetyNumber={handleOpenSafetyNumber}
          onStartCall={handleStartCall}
          onCreateCallLink={() => setIsCallLinkOpen(true)}
          onOpenAddStory={() => setIsStoryCreatorOpen(true)}
          onToggleInfoDrawer={() => setIsInfoDrawerOpen(!isInfoDrawerOpen)}
          onMobileBack={() => setIsMobileChatOpen(false)}
        />

        {/* Collapsible Info Drawer (right side) */}
        {isInfoDrawerOpen && activeConversation && activeRailTab === "chats" && (

          <GroupInfoDrawer
            isOpen={isInfoDrawerOpen}
            onClose={() => setIsInfoDrawerOpen(false)}
            onOpenSafetyNumber={handleOpenSafetyNumber}
          />
        )}
      </div>

      {/* Modals */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onOpenNewGroup={() => setIsNewGroupOpen(true)}
      />

      <NewGroupModal
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
      />

      <CallLinkModal
        isOpen={isCallLinkOpen}
        onClose={() => setIsCallLinkOpen(false)}
        onJoinCall={() => {
          setIsCallLinkOpen(false);
          handleStartCall(true);
        }}
      />

      <StoryCreatorModal
        isOpen={isStoryCreatorOpen}
        onClose={() => setIsStoryCreatorOpen(false)}
      />

      <LinkedDevicesModal
        isOpen={isLinkedDevicesOpen}
        onClose={() => setIsLinkedDevicesOpen(false)}
      />

      {safetyNumberTarget && (
        <SafetyNumberModal
          contactUserId={safetyNumberTarget.userId}
          contactName={safetyNumberTarget.name}
          isOpen={!!safetyNumberTarget}
          onClose={() => setSafetyNumberTarget(null)}
        />
      )}

      {activeCall && (
        <CallModal
          contactName={activeCall.contactName}
          avatarUrl={activeCall.avatarUrl}
          isVideo={activeCall.isVideo}
          isOpen={!!activeCall}
          onClose={() => setActiveCall(null)}
        />
      )}
    </main>
  );
}
