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
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#121214] text-white">
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
    <main className="h-screen w-screen flex overflow-hidden bg-[#121214] text-white font-sans select-none">
      {/* 1. Far-Left Activity Rail (56px) */}
      <ActivityRail
        activeTab={activeRailTab}
        onSelectTab={(tab) => {
          setActiveRailTab(tab);
          if (tab === "settings") {
            setActiveSettingsSection("profile");
          }
        }}
        unreadChatsCount={unreadCount}
        onToggleSidebar={() => setIsSidebarVisible((v) => !v)}
      />

      {/* 2. Middle Sub-Sidebar (340px) */}
      {isSidebarVisible && (
        <div className="flex h-full">
          <SubSidebar
            activeRailTab={activeRailTab}
            activeSettingsSection={activeSettingsSection}
            onSelectSettingsSection={(sec) => setActiveSettingsSection(sec)}
            onOpenCompose={() => setIsNewChatOpen(true)}
            onOpenNewGroup={() => setIsNewGroupOpen(true)}
            onCreateCallLink={() => setIsCallLinkOpen(true)}
            onOpenAddStory={() => setIsStoryCreatorOpen(true)}
          />
        </div>
      )}

      {/* 3. Main Canvas (Chat feed / Calls canvas / Stories canvas / Settings view) */}
      <div className="flex-1 h-full flex overflow-hidden">
        <MainCanvas
          activeRailTab={activeRailTab}
          activeSettingsSection={activeSettingsSection}
          onOpenSafetyNumber={handleOpenSafetyNumber}
          onStartCall={handleStartCall}
          onCreateCallLink={() => setIsCallLinkOpen(true)}
          onOpenAddStory={() => setIsStoryCreatorOpen(true)}
          onToggleInfoDrawer={() => setIsInfoDrawerOpen(!isInfoDrawerOpen)}
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
