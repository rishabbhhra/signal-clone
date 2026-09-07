"use client";

import React, { useState, useEffect } from "react";
import { useSignal } from "@/context/SignalContext";
import { Sidebar } from "@/components/Sidebar";
import { ChatPane } from "@/components/ChatPane";
import { GroupInfoDrawer } from "@/components/GroupInfoDrawer";
import { AuthScreen } from "@/components/AuthScreen";
import { SettingsModal } from "@/components/Modals/SettingsModal";
import { NewChatModal } from "@/components/Modals/NewChatModal";
import { NewGroupModal } from "@/components/Modals/NewGroupModal";
import { SafetyNumberModal } from "@/components/Modals/SafetyNumberModal";
import { CallModal } from "@/components/Modals/CallModal";
import { StoriesModal } from "@/components/Modals/StoriesModal";
import { LinkedDevicesModal } from "@/components/Modals/LinkedDevicesModal";
import { Lock } from "lucide-react";

export default function Home() {
  const { currentUser, isLoading, activeConversation, setActiveConversationId } = useSignal();

  // Modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isStoriesOpen, setIsStoriesOpen] = useState(false);
  const [isLinkedDevicesOpen, setIsLinkedDevicesOpen] = useState(false);
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);

  // Safety number modal state
  const [safetyNumberTarget, setSafetyNumberTarget] = useState<{
    userId: string;
    name: string;
  } | null>(null);

  // Call modal state
  const [activeCall, setActiveCall] = useState<{
    isVideo: boolean;
    contactName: string;
    avatarUrl?: string | null;
  } | null>(null);

  // Keyboard shortcuts (Cmd+K for new chat search, Esc to close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsNewChatOpen(true);
      }
      if (e.key === "Escape") {
        setIsSettingsOpen(false);
        setIsNewChatOpen(false);
        setIsNewGroupOpen(false);
        setIsStoriesOpen(false);
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
        <p className="text-xs text-gray-500 mt-1 font-mono">Initializing secure connection...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  const handleStartCall = (isVideo: boolean) => {
    if (!activeConversation) return;
    const name =
      activeConversation.type === "group"
        ? activeConversation.name || "Group"
        : activeConversation.direct_recipient?.display_name || "Contact";
    const avatar =
      activeConversation.type === "group"
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

  return (
    <main className="h-screen w-screen flex overflow-hidden bg-white dark:bg-[#121214]">
      {/* Sidebar: Visible on desktop, or on mobile when no active conversation */}
      <div
        className={`h-full ${
          activeConversation ? "hidden md:flex" : "flex w-full"
        }`}
      >
        <Sidebar
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenNewChat={() => setIsNewChatOpen(true)}
          onOpenStories={() => setIsStoriesOpen(true)}
          onOpenLinkedDevices={() => setIsLinkedDevicesOpen(true)}
        />
      </div>

      {/* Chat Pane: Visible on desktop, or on mobile when active conversation selected */}
      <div
        className={`flex-1 h-full ${
          activeConversation ? "flex" : "hidden md:flex"
        }`}
      >
        <ChatPane
          onBackMobile={() => setActiveConversationId(null)}
          onToggleInfoDrawer={() => setIsInfoDrawerOpen(!isInfoDrawerOpen)}
          onStartCall={handleStartCall}
          onOpenSafetyNumber={handleOpenSafetyNumber}
        />
      </div>

      {/* Collapsible Info Drawer (right side) */}
      {isInfoDrawerOpen && activeConversation && (
        <GroupInfoDrawer
          isOpen={isInfoDrawerOpen}
          onClose={() => setIsInfoDrawerOpen(false)}
          onOpenSafetyNumber={handleOpenSafetyNumber}
        />
      )}

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenLinkedDevices={() => setIsLinkedDevicesOpen(true)}
      />

      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onOpenNewGroup={() => setIsNewGroupOpen(true)}
      />

      <NewGroupModal
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
      />

      <StoriesModal
        isOpen={isStoriesOpen}
        onClose={() => setIsStoriesOpen(false)}
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
