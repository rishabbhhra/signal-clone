"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Shield,
  Palette,
  Bell,
  MessageSquare,
  Info,
  LogOut,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Check,
  Smartphone,
} from "lucide-react";
import { useSignal } from "@/context/SignalContext";
import { Avatar } from "@/components/Avatar";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLinkedDevices: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenLinkedDevices,
}) => {
  const {
    currentUser,
    theme,
    toggleTheme,
    soundEnabled,
    setSoundEnabled,
    logout,
    updateProfile,
  } = useSignal();

  const [activeTab, setActiveTab] = useState<"profile" | "privacy" | "appearance" | "notifications" | "chats" | "about">("profile");

  // Edit profile state
  const [displayName, setDisplayName] = useState(currentUser?.display_name || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when opened
  React.useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.display_name || "");
      setBio(currentUser.bio || "");
      setAvatarUrl(currentUser.avatar_url || "");
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        display_name: displayName.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl.trim() || undefined,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const AVATAR_PRESETS = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=AliceSmith&hair=long01`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=BobJohnson&hair=short01`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Moxie&hair=dreads01`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Snowden&facialHair=beardLight`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`,
    `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.username}`,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1c1c1f] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Left Settings Navigation */}
        <div className="w-full md:w-56 bg-gray-50 dark:bg-[#17171a] p-3 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Settings
            </div>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "profile"
                  ? "bg-signal-blue text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/60"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("privacy")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "privacy"
                  ? "bg-signal-blue text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/60"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Privacy</span>
            </button>

            <button
              onClick={() => setActiveTab("appearance")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "appearance"
                  ? "bg-signal-blue text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/60"
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Appearance</span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "notifications"
                  ? "bg-signal-blue text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/60"
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenLinkedDevices();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-colors"
            >
              <Smartphone className="w-4 h-4" />
              <span>Linked Devices</span>
            </button>

            <button
              onClick={() => setActiveTab("about")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "about"
                  ? "bg-signal-blue text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/60"
              }`}
            >
              <Info className="w-4 h-4" />
              <span>About</span>
            </button>
          </div>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-2.5 px-3 py-2.5 mt-4 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg capitalize">
              {activeTab}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable tab body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="flex items-center gap-4">
                  <Avatar name={displayName || currentUser.username} url={avatarUrl} size="xl" showOnlineBadge={false} />
                  <div>
                    <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100">{currentUser.display_name}</h4>
                    <p className="text-xs text-gray-500 font-mono">@{currentUser.username}</p>
                    {currentUser.phone_number && (
                      <p className="text-xs text-gray-400">{currentUser.phone_number}</p>
                    )}
                  </div>
                </div>

                {/* Avatar Preset Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Choose Preset Avatar
                  </label>
                  <div className="flex items-center gap-3">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setAvatarUrl(preset)}
                        className={`rounded-full p-0.5 border-2 transition-transform hover:scale-105 ${
                          avatarUrl === preset ? "border-signal-blue scale-110" : "border-transparent"
                        }`}
                      >
                        <Avatar name={`Preset ${idx}`} url={preset} size="sm" showOnlineBadge={false} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-signal-blue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    About / Bio
                  </label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-signal-blue"
                    placeholder="Hey there! I am using Signal."
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-signal-blue hover:bg-signal-blue-hover text-white text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  {saveSuccess && (
                    <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                      <Check className="w-4 h-4" /> Profile updated!
                    </span>
                  )}
                </div>
              </form>
            )}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#161619] border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Read Receipts</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Show double blue checkmarks when messages are seen
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 accent-signal-blue rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#161619] border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Typing Indicators</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Let contacts see when you are typing a message
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 accent-signal-blue rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#161619] border border-gray-200 dark:border-gray-800">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Your Safety Number</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Used to cryptographically verify end-to-end encryption keys
                  </p>
                  <div className="font-mono text-xs text-signal-blue bg-white dark:bg-[#202025] p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 select-all">
                    {currentUser.safety_number}
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#161619] border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {theme === "dark" ? <Moon className="w-5 h-5 text-signal-blue" /> : <Sun className="w-5 h-5 text-amber-500" />}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Dark Theme</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Signal dark mode charcoal interface
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
                  >
                    Switch to {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#161619] border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-500" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Message Sounds</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Play audio tones for incoming and outgoing messages
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      soundEnabled
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {soundEnabled ? "Enabled" : "Muted"}
                  </button>
                </div>
              </div>
            )}

            {/* About Tab */}
            {activeTab === "about" && (
              <div className="space-y-4 text-xs text-gray-600 dark:text-gray-400">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#161619] border border-gray-200 dark:border-gray-800 space-y-2">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Signal Messaging Platform</h4>
                  <p>Fullstack Signal Clone built with FastAPI, SQLite, WebSockets, and Next.js (TypeScript).</p>
                  <p className="pt-2 text-gray-500">Version 1.0.0 • Privacy by Design</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
