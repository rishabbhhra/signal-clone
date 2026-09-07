"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Globe,
  SunMoon,
  Palette,
  ZoomIn,
  ChevronRight,
  ChevronDown,
  User,
  Edit2,
  Lock,
  Shield,
  Smartphone,
  Check,
  FolderPlus,
  Folder,
  Clock,
  HelpCircle,
  ExternalLink,
  Heart,
  Archive,
  PieChart,
  HardDrive,
  Download,
  Upload,
  X,
  Trash2,
  Plus,
  Ban,
  Bell,
  CheckCircle2,
  RotateCw,
  Camera,
  AtSign,
} from "lucide-react";
import { SettingsSection } from "./SubSidebar";
import { useSignal } from "@/context/SignalContext";
import { api } from "@/lib/api";

interface SettingsViewsProps {
  activeSection: SettingsSection;
  onNavigateSection?: (section: SettingsSection) => void;
}

// Reusable Signal-Styled Toggle Switch
export const SignalSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden ${
        checked ? "bg-[#3a76f0]" : "bg-[#38383e]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out mt-0.5 ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
};

// Reusable Signal-Styled Dropdown Select
export const SignalSelect: React.FC<{
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}> = ({ value, options, onChange }) => {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-[#28282c] hover:bg-[#323238] text-xs text-zinc-200 pl-3 pr-7 py-1.5 rounded-lg cursor-pointer focus:outline-hidden transition-colors font-normal"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#242428] text-white">
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 pointer-events-none" />
    </div>
  );
};

export const SettingsViews: React.FC<SettingsViewsProps> = ({ activeSection }) => {
  const {
    currentUser,
    updateProfile,
    conversations,
    messages,
    refreshContacts,
    refreshConversations,
    settings,
    updateSetting,
  } = useSignal();

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Profile Edit State
  const [firstName, setFirstName] = useState(
    currentUser?.display_name?.split(" ")[0] || "Rishabh"
  );
  const [lastName, setLastName] = useState(
    currentUser?.display_name?.split(" ").slice(1).join(" ") || ""
  );
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [username, setUsername] = useState(currentUser?.username || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      const parts = (currentUser.display_name || "").split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
      setBio(currentUser.bio || "");
      setUsername(currentUser.username || "");
    }
  }, [currentUser]);

  // Appearance popup state
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Modals state
  const [isChatFoldersOpen, setIsChatFoldersOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isBlockedOpen, setIsBlockedOpen] = useState(false);
  const [newBlockName, setNewBlockName] = useState("");
  const [isPhonePrivacyOpen, setIsPhonePrivacyOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isNotificationProfilesOpen, setIsNotificationProfilesOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupGeneratedPassphrase, setBackupGeneratedPassphrase] = useState<string>("");
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [isDeleteDataOpen, setIsDeleteDataOpen] = useState(false);

  const skinTones = ["✋", "✋🏻", "✋🏼", "✋🏽", "✋🏾", "✋🏿"];
  const chatColors = [
    { name: "Signal Blue", hex: "#2c6bed" },
    { name: "Ultramarine", hex: "#3b5998" },
    { name: "Crimson", hex: "#e11d48" },
    { name: "Emerald", hex: "#10b981" },
    { name: "Amber", hex: "#f59e0b" },
    { name: "Purple", hex: "#8b5cf6" },
  ];

  const languages = [
    "System Language",
    "English (US)",
    "English (UK)",
    "Español (Spanish)",
    "Français (French)",
    "Deutsch (German)",
    "Italiano (Italian)",
    "Nederlands (Dutch)",
    "Português (Portuguese)",
    "Русский (Russian)",
    "中文 (Chinese)",
    "日本語 (Japanese)",
    "हिन्दी (Hindi)",
  ];

  const notificationProfiles = [
    { name: "All Notifications", desc: "Allow all messages and calls" },
    { name: "Work", desc: "Only allow work contacts and mentions" },
    { name: "Focus", desc: "Mute all except direct priority contacts" },
    { name: "Sleep", desc: "Silence all notification sounds and banners" },
  ];

  // Save Profile Handler
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const full = lastName.trim() ? `${firstName.trim()} ${lastName.trim()}` : firstName.trim();
      await updateProfile({
        display_name: full,
        bio: bio.trim(),
      });
      setProfileSaved(true);
      showToast("Profile changes saved successfully!");
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (e) {
      console.error(e);
      showToast("Failed to save profile changes.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Avatar Image Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast("Uploading photo...");
      const res = await api.uploadFile(file);
      const url = res.file_url.startsWith("http")
        ? res.file_url
        : `http://localhost:8000${res.file_url}`;
      await updateProfile({ avatar_url: url });
      showToast("Profile photo updated!");
    } catch (err) {
      console.error("Upload error:", err);
      showToast("Failed to upload photo.");
    }
  };

  // Export Chat History Handler
  const handleExportChats = () => {
    try {
      const exportData = {
        exported_at: new Date().toISOString(),
        user: currentUser,
        conversations_count: conversations.length,
        messages_count: messages.length,
        conversations: conversations.map((c) => ({
          id: c.id,
          name: c.name || c.direct_recipient?.display_name || "Direct Chat",
          type: c.type,
          updated_at: c.updated_at,
          disappearing_seconds: c.disappearing_seconds,
        })),
        messages: messages.map((m) => ({
          id: m.id,
          conversation_id: m.conversation_id,
          sender_id: m.sender_id,
          content: m.content,
          message_type: m.message_type,
          file_url: m.file_url,
          created_at: m.created_at,
          status: m.status,
        })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `signal-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Chat export downloaded!");
    } catch (err) {
      console.error(err);
      showToast("Failed to export chats.");
    }
  };

  // Import Contacts Handler
  const handleImportContacts = async () => {
    try {
      await refreshContacts();
      await refreshConversations();
      showToast("Synced contacts from mobile device successfully.");
    } catch {
      showToast("Failed to sync contacts.");
    }
  };

  // Check for Updates Handler
  const handleCheckUpdates = () => {
    setIsCheckingUpdates(true);
    setTimeout(() => {
      setIsCheckingUpdates(false);
      showToast("Signal Desktop is up to date (v7.42.0 - Apple Silicon).");
    }, 1400);
  };

  // Generate 30-digit backup passphrase
  const generateBackupPassphrase = () => {
    const segments = [];
    for (let i = 0; i < 6; i++) {
      const rand = Math.floor(10000 + Math.random() * 90000);
      segments.push(rand.toString());
    }
    const passphrase = segments.join(" ");
    setBackupGeneratedPassphrase(passphrase);
    setIsBackupModalOpen(true);
    setBackupConfirmed(false);
  };

  return (
    <div className="flex-1 h-full bg-[#1e1e20] overflow-y-auto select-none relative">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-8 z-50 bg-[#222228] text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-[#383842] flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          VIEW 1: CHATS (Screenshot 1: media_1788798727063.png)
      ========================================================================= */}
      {activeSection === "chats" && (
        <div className="max-w-2xl mx-auto w-full py-10 px-6 space-y-6 animate-in fade-in duration-150">
          <h2 className="text-center text-zinc-100 font-semibold text-sm tracking-wide">Chats</h2>

          {/* Card 1: Address Book Photos & Muted Chats */}
          <div className="bg-[#1e1e22] rounded-2xl p-4 divide-y divide-[#28282e]">
            <div className="flex items-center justify-between pb-3">
              <div className="pr-4">
                <h4 className="text-xs font-normal text-zinc-200">Use address book photos</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Display contact photos from your address book if available.</p>
              </div>
              <SignalSwitch
                checked={settings.useAddressBookPhotos}
                onChange={(val) => {
                  updateSetting("useAddressBookPhotos", val);
                  showToast(val ? "Address book photos enabled" : "Address book photos disabled");
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="pr-4">
                <h4 className="text-xs font-normal text-zinc-200">Keep muted chats archived</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Muted chats that are archived will remain archived when a new message arrives.</p>
              </div>
              <SignalSwitch
                checked={settings.keepMutedArchived}
                onChange={(val) => {
                  updateSetting("keepMutedArchived", val);
                  showToast(val ? "Muted chats will stay archived" : "Muted chats will unarchive on message");
                }}
              />
            </div>
          </div>

          {/* Section: Text input */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2 px-1">Text input</h3>
            <div className="bg-[#1e1e22] rounded-2xl p-4 divide-y divide-[#28282e]">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-normal text-zinc-200">Spell check text entered in message composition box</span>
                <SignalSwitch
                  checked={settings.spellCheck}
                  onChange={(val) => {
                    updateSetting("spellCheck", val);
                    showToast(val ? "Spell check enabled" : "Spell check disabled");
                  }}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-normal text-zinc-200">Show text formatting popover when text is selected</span>
                <SignalSwitch
                  checked={settings.showFormattingPopover}
                  onChange={(val) => {
                    updateSetting("showFormattingPopover", val);
                    showToast(val ? "Formatting popover enabled" : "Formatting popover disabled");
                  }}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="pr-4">
                  <h4 className="text-xs font-normal text-zinc-200">Generate link previews</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Retrieve link previews directly from websites for messages you send.</p>
                </div>
                <SignalSwitch
                  checked={settings.generateLinkPreviews}
                  onChange={(val) => {
                    updateSetting("generateLinkPreviews", val);
                    showToast(val ? "Link previews enabled" : "Link previews disabled");
                  }}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="pr-4">
                  <h4 className="text-xs font-normal text-zinc-200">Convert typed emoticons to emoji</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">For example, :-) will be converted to 🙂</p>
                </div>
                <SignalSwitch
                  checked={settings.convertEmoticons}
                  onChange={(val) => {
                    updateSetting("convertEmoticons", val);
                    showToast(val ? "Emoticons auto-conversion enabled" : "Emoticons conversion disabled");
                  }}
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-xs font-normal text-zinc-200">Emoji skin tone</span>
                <div className="flex items-center gap-1.5">
                  {skinTones.map((tone, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        updateSetting("selectedSkinTone", idx);
                        showToast(`Emoji skin tone set to ${tone}`);
                      }}
                      className={`text-base p-1 rounded-lg transition-all ${
                        settings.selectedSkinTone === idx
                          ? "bg-[#2f2f36] scale-110 shadow-xs ring-1 ring-zinc-500"
                          : "hover:bg-[#28282e] opacity-80 hover:opacity-100"
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Chat folders */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2 px-1">Chat folders</h3>
            <div
              onClick={() => setIsChatFoldersOpen(true)}
              className="bg-[#1e1e22] rounded-2xl p-4 flex items-center justify-between hover:bg-[#232328] transition-colors cursor-pointer"
            >
              <div>
                <h4 className="text-xs font-normal text-zinc-200">
                  {settings.chatFolders.length > 0
                    ? `${settings.chatFolders.length} chat folder(s) active`
                    : "Add a chat folder"}
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Organize your chats into folders and quickly switch between them on your chat list.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            </div>
          </div>

          {/* Card 4: Export chat history */}
          <div className="bg-[#1e1e22] rounded-2xl p-4 flex items-center justify-between">
            <div className="pr-4">
              <h4 className="text-xs font-normal text-zinc-200">Export chat history</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Export a machine-readable JSON copy of all your chats. Disappearing messages will not be exported.
              </p>
            </div>
            <button
              onClick={handleExportChats}
              className="px-4 py-1.5 rounded-lg bg-[#28282c] hover:bg-[#34343a] text-zinc-200 text-xs font-medium transition-colors flex-shrink-0 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>

          {/* Card 5: Import contacts */}
          <div className="bg-[#1e1e22] rounded-2xl p-4 flex items-center justify-between">
            <div className="pr-4">
              <h4 className="text-xs font-normal text-zinc-200">Import contacts</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Import all Signal groups and contacts from your mobile device. Last import at 9/7/2026 5:10:11 PM
              </p>
            </div>
            <button
              onClick={handleImportContacts}
              className="px-4 py-1.5 rounded-lg bg-[#28282c] hover:bg-[#34343a] text-zinc-200 text-xs font-medium transition-colors flex-shrink-0 flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Import now</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: CALLS (Screenshot 2: media_1788798727065.png)
      ========================================================================= */}
      {activeSection === "calls" && (
        <div className="max-w-2xl mx-auto w-full py-10 px-6 space-y-6 animate-in fade-in duration-150">
          <h2 className="text-center text-zinc-100 font-semibold text-sm tracking-wide">Calls</h2>

          {/* Card 1: Enable Calls & Calling Sounds */}
          <div className="bg-[#1e1e22] rounded-2xl p-4 divide-y divide-[#28282e]">
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-normal text-zinc-200">Enable incoming calls</span>
              <SignalSwitch
                checked={settings.enableIncomingCalls}
                onChange={(val) => {
                  updateSetting("enableIncomingCalls", val);
                  showToast(val ? "Incoming calls enabled" : "Incoming calls disabled");
                }}
              />
            </div>
            <div className="flex items-center justify-between pt-3">
              <span className="text-xs font-normal text-zinc-200">Play calling sounds</span>
              <SignalSwitch
                checked={settings.playCallingSounds}
                onChange={(val) => {
                  updateSetting("playCallingSounds", val);
                  showToast(val ? "Calling sounds enabled" : "Calling sounds muted");
                }}
              />
            </div>
          </div>

          {/* Section: Devices */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2 px-1">Devices</h3>
            <div className="bg-[#1e1e22] rounded-2xl p-4 divide-y divide-[#28282e]">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-normal text-zinc-200">Video</span>
                <SignalSelect
                  value={settings.selectedVideoDevice}
                  onChange={(val) => {
                    updateSetting("selectedVideoDevice", val);
                    showToast(`Camera: ${val}`);
                  }}
                  options={[
                    { label: "FaceTime HD Camera (C4E1:9BFB)", value: "FaceTime HD Camera (C4E1:9BFB)" },
                    { label: "Built-in Camera", value: "Built-in Camera" },
                    { label: "External USB Camera", value: "External USB Camera" },
                  ]}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-normal text-zinc-200">Microphone</span>
                <SignalSelect
                  value={settings.selectedMicDevice}
                  onChange={(val) => {
                    updateSetting("selectedMicDevice", val);
                    showToast(`Microphone: ${val}`);
                  }}
                  options={[
                    { label: "Default (Airdopes 161)", value: "Default (Airdopes 161)" },
                    { label: "MacBook Air Microphone", value: "MacBook Air Microphone" },
                    { label: "External Microphone", value: "External Microphone" },
                  ]}
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-xs font-normal text-zinc-200">Speakers</span>
                <SignalSelect
                  value={settings.selectedSpeakerDevice}
                  onChange={(val) => {
                    updateSetting("selectedSpeakerDevice", val);
                    showToast(`Output: ${val}`);
                  }}
                  options={[
                    { label: "Default (Airdopes 161)", value: "Default (Airdopes 161)" },
                    { label: "MacBook Air Speakers", value: "MacBook Air Speakers" },
                    { label: "External Headphones", value: "External Headphones" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Section: Advanced */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2 px-1">Advanced</h3>
            <div className="bg-[#1e1e22] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="pr-4">
                  <h4 className="text-xs font-normal text-zinc-200">Always relay calls</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Relay all calls through the Signal server to avoid revealing your IP address to your contact. Enabling will reduce call quality.
                  </p>
                </div>
                <SignalSwitch
                  checked={settings.alwaysRelayCalls}
                  onChange={(val) => {
                    updateSetting("alwaysRelayCalls", val);
                    showToast(val ? "Always relay calls enabled" : "Relay calls disabled");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: NOTIFICATIONS (Screenshot 3: media_1788798727067.png)
      ========================================================================= */}
      {activeSection === "notifications" && (
        <div className="max-w-2xl mx-auto w-full py-10 px-6 space-y-6 animate-in fade-in duration-150">
          <h2 className="text-center text-zinc-100 font-semibold text-sm tracking-wide">Notifications</h2>

          {/* Card 1: Main Notification Toggles */}
          <div className="bg-[#1e1e22] rounded-2xl p-4 divide-y divide-[#28282e]">
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-normal text-zinc-200">Enable notifications</span>
              <SignalSwitch
                checked={settings.enableNotifications}
                onChange={(val) => {
                  updateSetting("enableNotifications", val);
                  showToast(val ? "Notifications enabled" : "Notifications muted");
                }}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-xs font-normal text-zinc-200">Show notifications for calls</span>
              <SignalSwitch
                checked={settings.showCallNotifications}
                onChange={(val) => {
                  updateSetting("showCallNotifications", val);
                  showToast(val ? "Call notifications enabled" : "Call notifications disabled");
                }}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="pr-4">
                <h4 className="text-xs font-normal text-zinc-200">Reaction notifications</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Notify when someone reacts to your message</p>
              </div>
              <SignalSwitch
                checked={settings.reactionNotifications}
                onChange={(val) => {
                  updateSetting("reactionNotifications", val);
                  showToast(val ? "Reaction notifications enabled" : "Reaction notifications disabled");
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-xs font-normal text-zinc-200">Notification content</span>
              <SignalSelect
                value={settings.notificationContent}
                onChange={(val) => {
                  updateSetting("notificationContent", val);
                  showToast(`Notification content: ${val}`);
                }}
                options={[
                  { label: "Name, content, and actions", value: "Name, content, and actions" },
                  { label: "Name only", value: "Name only" },
                  { label: "No name or content", value: "No name or content" },
                ]}
              />
            </div>
          </div>

          {/* Section: Sounds */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2 px-1">Sounds</h3>
            <div className="bg-[#1e1e22] rounded-2xl p-4 divide-y divide-[#28282e]">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-normal text-zinc-200">Push notification sounds</span>
                <SignalSwitch
                  checked={settings.pushNotificationSounds}
                  onChange={(val) => {
                    updateSetting("pushNotificationSounds", val);
                    showToast(val ? "Push notification sounds enabled" : "Push sounds disabled");
                  }}
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div className="pr-4">
                  <h4 className="text-xs font-normal text-zinc-200">In-chat message sounds</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Hear a notification sound for sent and received messages while in the chat.</p>
                </div>
                <SignalSwitch
                  checked={settings.inChatMessageSounds}
                  onChange={(val) => {
                    updateSetting("inChatMessageSounds", val);
                    showToast(val ? "In-chat message sounds enabled" : "In-chat sounds disabled");
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section: App badge */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2 px-1">App badge</h3>
            <div className="bg-[#1e1e22] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-normal text-zinc-200">Include muted chats in badge count</span>
                <SignalSwitch
                  checked={settings.includeMutedInBadge}
                  onChange={(val) => {
                    updateSetting("includeMutedInBadge", val);
                    showToast(val ? "Muted chats included in badge" : "Muted chats excluded from badge");
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 4: Notification profiles */}
          <div
            onClick={() => setIsNotificationProfilesOpen(true)}
            className="bg-[#1e1e22] rounded-2xl p-4 flex items-center justify-between hover:bg-[#232328] transition-colors cursor-pointer"
          >
            <div>
              <h4 className="text-xs font-normal text-zinc-200">Notification profiles</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Active: <span className="text-signal-blue font-medium">${settings.activeNotificationProfile}</span>
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: PRIVACY (Screenshot 4: media_1788798727069.png)
      ========================================================================= */}
      {activeSection === "privacy" && (
        <div className="max-w-2xl mx-auto w-full py-10 px-6 space-y-6 animate-in fade-in duration-150">
          <h2 className="text-center text-zinc-100 font-semibold text-sm tracking-wide">Privacy</h2>

          {/* Card 1: Phone Number */}
          <div
            onClick={() => setIsPhonePrivacyOpen(true)}
            className="bg-[#1e1e22] rounded-2xl p-4 flex items-center justify-between hover:bg-[#232328] transition-colors cursor-pointer"
          >
            <div>
              <h4 className="text-xs font-normal text-zinc-200">Phone Number</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Visibility: <span className="text-signal-blue capitalize">${settings.phonePrivacy}</span>. Choose who can see and contact you.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          </div>

          {/* Card 2: Blocked */}
          <div
            onClick={() => setIsBlockedOpen(true)}
            className="bg-[#1e1e22] rounded-2xl p-4 flex items-center justify-between hover:bg-[#232328] transition-colors cursor-pointer"
          >
            <div>
              <h4 className="text-xs font-normal text-zinc-200">Blocked</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {settings.blockedUsers.length > 0
                  ? `${settings.blockedUsers.length} contact(s) blocked`
                  : "No users or groups"}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          </div>

          {/* Section: Messaging */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2 px-1">Messaging</h3>
            <div className="bg-[#1e1e22] rounded-2xl p-4 divide-y divide-[#28282e]">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-normal text-zinc-200">Read receipts</span>
                <SignalSwitch
                  checked={settings.readReceipts}
                  onChange={(val) => {
                    updateSetting("readReceipts", val);
                    showToast(val ? "Read receipts enabled" : "Read receipts disabled");
                  }}
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-xs font-normal text-zinc-200">Typing indicators</span>
                <SignalSwitch
                  checked={settings.typingIndicators}
                  onChange={(val) => {
                    updateSetting("typingIndicators", val);
                    showToast(val ? "Typing indicators enabled" : "Typing indicators hidden");
                  }}
                />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2 px-1 leading-relaxed">
              See and share when messages are being read and typed. If disabled, you won&apos;t see read receipts or typing indicators from others.
            </p>
          </div>

          {/* Section: Disappearing messages */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2 px-1">Disappearing messages</h3>
            <div className="bg-[#1e1e22] rounded-2xl p-4 flex items-center justify-between">
              <div className="pr-4">
                <h4 className="text-xs font-normal text-zinc-200">Default timer for new chats</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Set a default disappearing message timer for all new chats started by you.</p>
              </div>
              <SignalSelect
                value={settings.defaultDisappearingTimer}
                onChange={(val) => {
                  updateSetting("defaultDisappearingTimer", val);
                  showToast(`Default timer for new chats: ${val}`);
                }}
                options={[
                  { label: "Off", value: "Off" },
                  { label: "4 weeks", value: "4 weeks" },
                  { label: "1 week", value: "1 week" },
                  { label: "1 day", value: "1 day" },
                  { label: "8 hours", value: "8 hours" },
                  { label: "1 hour", value: "1 hour" },
                  { label: "5 minutes", value: "5 minutes" },
                  { label: "30 seconds", value: "30 seconds" },
                ]}
              />
            </div>
          </div>

          {/* Section: Stories */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2 px-1">Stories</h3>
            <div className="bg-[#1e1e22] rounded-2xl p-4 flex items-center justify-between">
              <div className="pr-4">
                <h4 className="text-xs font-normal text-zinc-200">Share &amp; View Stories</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {settings.storiesEnabled
                    ? "Stories are active. If you opt out of stories you will no longer be able to share or view stories."
                    : "Stories are currently disabled."}
                </p>
              </div>
              <button
                onClick={() => {
                  const next = !settings.storiesEnabled;
                  updateSetting("storiesEnabled", next);
                  showToast(next ? "Stories enabled" : "Stories turned off");
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                  settings.storiesEnabled
                    ? "bg-[#391d22] hover:bg-[#482228] text-[#f87171]"
                    : "bg-[#1d3928] hover:bg-[#224832] text-[#4ade80]"
                }`}
              >
                {settings.storiesEnabled ? "Turn off stories" : "Turn on stories"}
              </button>
            </div>
          </div>

          {/* Section: Advanced */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2 px-1">Advanced</h3>
            <div className="bg-[#1e1e22] rounded-2xl p-4 divide-y divide-[#28282e]">
              <div className="flex items-center justify-between pb-3">
                <div className="pr-4">
                  <h4 className="text-xs font-normal text-zinc-200 flex items-center gap-1.5">
                    Show status icon <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Show an icon in message details when they were delivered using sealed sender.</p>
                </div>
                <SignalSwitch
                  checked={settings.sealedSenderIcon}
                  onChange={(val) => {
                    updateSetting("sealedSenderIcon", val);
                    showToast(val ? "Sealed sender icon enabled" : "Sealed sender icon hidden");
                  }}
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div className="pr-4">
                  <h4 className="text-xs font-normal text-zinc-200">Automatic key verification</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    When enabled, Signal will attempt to automatically verify the encryption of 1:1 chats.
                  </p>
                </div>
                <SignalSwitch
                  checked={settings.autoKeyVerification}
                  onChange={(val) => {
                    updateSetting("autoKeyVerification", val);
                    showToast(val ? "Auto key verification enabled" : "Auto key verification disabled");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 5: APPEARANCE (Screenshot 5: media_1788798727070.png)
      ========================================================================= */}
      {activeSection === "appearance" && (
        <div className="max-w-2xl mx-auto w-full py-10 px-6 space-y-6 animate-in fade-in duration-150">
          <h2 className="text-center text-zinc-100 font-semibold text-sm tracking-wide">Appearance</h2>

          {/* Main Card: Language, Theme, Chat color, Zoom level */}
          <div className="bg-[#1e1e22] rounded-2xl p-4 divide-y divide-[#28282e]">
            {/* Language */}
            <div
              onClick={() => setIsLanguageOpen(true)}
              className="flex items-center justify-between pb-3 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-zinc-300" />
                <span className="text-xs font-normal text-zinc-200">Language</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span>{settings.language}</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              </div>
            </div>

            {/* Theme */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <SunMoon className="w-4 h-4 text-zinc-300" />
                <span className="text-xs font-normal text-zinc-200">Theme</span>
              </div>
              <SignalSelect
                value={settings.themeMode}
                onChange={(val: any) => {
                  updateSetting("themeMode", val);
                  showToast(`Theme set to ${val}`);
                }}
                options={[
                  { label: "System", value: "System" },
                  { label: "Dark", value: "Dark" },
                  { label: "Light", value: "Light" },
                ]}
              />
            </div>

            {/* Chat color */}
            <div className="flex items-center justify-between py-3 relative">
              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 text-zinc-300" />
                <span className="text-xs font-normal text-zinc-200">Chat color</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-5 h-5 rounded-full shadow-inner ring-2 ring-transparent hover:ring-zinc-400 transition-all cursor-pointer"
                  style={{ backgroundColor: settings.chatColor }}
                  title="Select chat bubble accent"
                />
              </div>

              {/* Color picker popup */}
              {showColorPicker && (
                <div className="absolute right-0 top-12 z-20 bg-[#25252a] p-2.5 rounded-xl shadow-xl border border-[#32323a] flex items-center gap-2">
                  {chatColors.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => {
                        updateSetting("chatColor", c.hex);
                        setShowColorPicker(false);
                        showToast(`Chat color changed to ${c.name}`);
                      }}
                      className="w-6 h-6 rounded-full transition-transform hover:scale-110 flex items-center justify-center text-white"
                      style={{ backgroundColor: c.hex }}
                    >
                      {settings.chatColor === c.hex && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Zoom level */}
            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-3">
                <ZoomIn className="w-4 h-4 text-zinc-300" />
                <span className="text-xs font-normal text-zinc-200">Zoom level</span>
              </div>
              <SignalSelect
                value={settings.zoomLevel}
                onChange={(val) => {
                  updateSetting("zoomLevel", val);
                  showToast(`Zoom level: ${val}`);
                }}
                options={[
                  { label: "80%", value: "80%" },
                  { label: "90%", value: "90%" },
                  { label: "100%", value: "100%" },
                  { label: "110%", value: "110%" },
                  { label: "125%", value: "125%" },
                ]}
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 6: PROFILE (Screenshot media_1788808797490.png)
      ========================================================================= */}
      {activeSection === "profile" && (
        <div className="max-w-md mx-auto w-full py-10 px-6 space-y-7 animate-in fade-in duration-150">
          <h2 className="text-center text-white font-medium text-sm">Profile</h2>

          {/* Avatar & Photo Upload */}
          <div className="flex flex-col items-center">
            <input
              type="file"
              ref={avatarFileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />

            <div
              onClick={() => avatarFileInputRef.current?.click()}
              className="relative w-20 h-20 rounded-full bg-[#c2c5cc] text-[#1c1c20] flex items-center justify-center font-bold text-3xl mb-2 shadow-xs overflow-hidden cursor-pointer group"
            >
              {currentUser?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{currentUser?.display_name ? currentUser.display_name[0].toUpperCase() : "R"}</span>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                <Camera className="w-5 h-5" />
              </div>
            </div>

            <button
              onClick={() => avatarFileInputRef.current?.click()}
              className="px-3.5 py-1 rounded-full bg-[#323236] hover:bg-[#3d3d42] text-xs font-normal text-gray-200 transition-colors"
            >
              Edit photo
            </button>
          </div>

          {/* Profile Name, About & Username Rows (Matching Screenshot media_1788808797490.png) */}
          <div className="space-y-4 pt-2">
            {/* Row 1: Name */}
            <div className="flex items-center gap-4 py-1 group">
              <User className="w-5 h-5 text-gray-400 stroke-[1.8] flex-shrink-0" />
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={handleSaveProfile}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveProfile(); }}
                className="bg-transparent text-white font-normal text-sm focus:outline-hidden focus:bg-[#28282c] px-2 py-1 rounded-lg w-full transition-colors cursor-text"
                placeholder="Rishabh"
              />
            </div>

            {/* Row 2: About */}
            <div className="flex items-center gap-4 py-1 group">
              <Edit2 className="w-5 h-5 text-gray-400 stroke-[1.8] flex-shrink-0" />
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                onBlur={handleSaveProfile}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveProfile(); }}
                className="bg-transparent text-white font-normal text-sm focus:outline-hidden focus:bg-[#28282c] px-2 py-1 rounded-lg w-full transition-colors cursor-text"
                placeholder="About"
              />
            </div>

            <p className="text-xs text-[#8e8e93] leading-relaxed pl-9">
              Your profile and changes to it will be visible to people you message, contacts and groups.
            </p>

            <hr className="border-[#2c2c30] my-6" />

            {/* Row 3: Username */}
            <div className="flex items-center gap-4 py-1 group">
              <AtSign className="w-5 h-5 text-gray-400 stroke-[1.8] flex-shrink-0" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={handleSaveProfile}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveProfile(); }}
                className="bg-transparent text-white font-normal text-sm focus:outline-hidden focus:bg-[#28282c] px-2 py-1 rounded-lg w-full transition-colors cursor-text"
                placeholder="Username"
              />
            </div>

            <p className="text-xs text-[#8e8e93] leading-relaxed pl-9">
              People can now message you using your optional username so you don&apos;t have to give out your phone number.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 7: GENERAL
      ========================================================================= */}
      {activeSection === "general" && (
        <div className="max-w-2xl mx-auto w-full py-10 px-6 space-y-6 animate-in fade-in duration-150">
          <h2 className="text-center text-white font-semibold text-sm tracking-wide">General</h2>

          {/* Card 1: Phone & Device */}
          <div className="p-4 rounded-2xl bg-[#1e1e22] border border-[#27272c] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-medium">Phone Number</span>
              <span className="text-gray-400 font-mono">{currentUser?.phone_number || "062041 65936"}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-gray-300 font-medium">Device Name</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">{settings.deviceName}</span>
                <button
                  onClick={() => {
                    const n = prompt("Change device name:", settings.deviceName);
                    if (n && n.trim()) {
                      updateSetting("deviceName", n.trim());
                      showToast(`Device name set to ${n.trim()}`);
                    }
                  }}
                  className="text-zinc-500 hover:text-white"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 pt-1 leading-relaxed border-t border-[#28282e]">
              To change the name of this device, open Signal on your phone and navigate to Settings &gt; Linked devices
            </p>
          </div>

          {/* Card 2: System */}
          <div className="p-4 rounded-2xl bg-[#1e1e22] border border-[#27272c] space-y-2">
            <h4 className="text-xs font-semibold text-gray-300">System</h4>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-gray-300">Open at computer login</span>
              <SignalSwitch
                checked={settings.openAtLogin}
                onChange={(val) => {
                  updateSetting("openAtLogin", val);
                  showToast(val ? "Open at computer login enabled" : "Open at login disabled");
                }}
              />
            </div>
          </div>

          {/* Card 3: Permissions */}
          <div className="p-4 rounded-2xl bg-[#1e1e22] border border-[#27272c] space-y-3">
            <h4 className="text-xs font-semibold text-gray-300">Permissions</h4>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Allow access to the microphone</span>
              <SignalSwitch
                checked={settings.micPermission}
                onChange={(val) => {
                  updateSetting("micPermission", val);
                  if (val && navigator.mediaDevices) {
                    navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {});
                  }
                  showToast(val ? "Microphone access granted" : "Microphone access revoked");
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Allow access to the camera</span>
              <SignalSwitch
                checked={settings.camPermission}
                onChange={(val) => {
                  updateSetting("camPermission", val);
                  if (val && navigator.mediaDevices) {
                    navigator.mediaDevices.getUserMedia({ video: true }).catch(() => {});
                  }
                  showToast(val ? "Camera access granted" : "Camera access revoked");
                }}
              />
            </div>
            <p className="text-[11px] text-gray-500 pt-1 border-t border-[#28282e]">
              Give this app permission to access your microphone and camera to make calls.
            </p>
          </div>

          {/* Card 4: Updates */}
          <div className="p-4 rounded-2xl bg-[#1e1e22] border border-[#27272c] flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-gray-300">Version 7.42.0</h4>
              <p className="text-[11px] text-gray-500">Signal is up to date</p>
            </div>
            <button
              onClick={handleCheckUpdates}
              disabled={isCheckingUpdates}
              className="px-3.5 py-1.5 rounded-lg bg-[#28282c] hover:bg-[#34343a] text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              {isCheckingUpdates && <RotateCw className="w-3 h-3 animate-spin" />}
              <span>{isCheckingUpdates ? "Checking..." : "Check for updates"}</span>
            </button>
          </div>

          {/* Card 5: Delete data */}
          <div className="p-4 rounded-2xl bg-[#1e1e22] border border-[#27272c] flex items-center justify-between">
            <div className="pr-4">
              <h4 className="text-xs font-semibold text-gray-300">Delete application data</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                This will delete all data in the application, removing all messages and saved account information.
              </p>
            </div>
            <button
              onClick={() => setIsDeleteDataOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#331c1e] hover:bg-[#422225] text-red-400 text-xs font-semibold transition-colors flex-shrink-0"
            >
              Delete data
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 8: DATA USAGE (Screenshot 1: media_1788799742735.png)
      ========================================================================= */}
      {activeSection === "data_usage" && (
        <div className="max-w-2xl mx-auto w-full py-10 px-6 space-y-6 animate-in fade-in duration-150">
          <h2 className="text-center text-zinc-100 font-semibold text-sm tracking-wide">Data usage</h2>

          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2 px-1">Media auto-download</h3>
            <div className="bg-[#1e1e22] rounded-2xl p-4 divide-y divide-[#28282e]">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-normal text-zinc-200">Photos</span>
                <SignalSwitch
                  checked={settings.autoDownloadPhotos}
                  onChange={(val) => {
                    updateSetting("autoDownloadPhotos", val);
                    showToast(val ? "Photo auto-download enabled" : "Photo auto-download disabled");
                  }}
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-normal text-zinc-200">Videos</span>
                <SignalSwitch
                  checked={settings.autoDownloadVideo}
                  onChange={(val) => {
                    updateSetting("autoDownloadVideo", val);
                    showToast(val ? "Video auto-download enabled" : "Video auto-download disabled");
                  }}
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-normal text-zinc-200">Audio</span>
                <SignalSwitch
                  checked={settings.autoDownloadAudio}
                  onChange={(val) => {
                    updateSetting("autoDownloadAudio", val);
                    showToast(val ? "Audio auto-download enabled" : "Audio auto-download disabled");
                  }}
                />
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-xs font-normal text-zinc-200">Documents</span>
                <SignalSwitch
                  checked={settings.autoDownloadDocs}
                  onChange={(val) => {
                    updateSetting("autoDownloadDocs", val);
                    showToast(val ? "Document auto-download enabled" : "Document auto-download disabled");
                  }}
                />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2 px-1">
              Voice messages and stickers are always auto-downloaded.
            </p>
          </div>

          <div className="bg-[#1e1e22] rounded-2xl p-4 flex items-center justify-between">
            <div className="pr-4">
              <h4 className="text-xs font-normal text-zinc-200">Sent media quality</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">Sending high quality media will use more data.</p>
            </div>
            <SignalSelect
              value={settings.sentMediaQuality}
              onChange={(val: any) => {
                updateSetting("sentMediaQuality", val);
                showToast(`Sent media quality: ${val}`);
              }}
              options={[
                { label: "Standard", value: "Standard" },
                { label: "High", value: "High" },
              ]}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 9: BACKUPS (Screenshot 3: media_1788799742737.png)
      ========================================================================= */}
      {activeSection === "backups" && (
        <div className="max-w-2xl mx-auto w-full py-10 px-6 space-y-6 animate-in fade-in duration-150">
          <h2 className="text-center text-zinc-100 font-semibold text-sm tracking-wide">Backups</h2>
          <p className="text-xs text-zinc-400 -mt-2">
            Back up your message history so you never lose data when you get a new phone or reinstall Signal.
          </p>

          <div className="bg-[#1e1e22] rounded-2xl p-4 flex items-start gap-3.5">
            <Clock className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-normal text-zinc-200">Signal Secure Backups</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                Automatic backups with Signal&apos;s secure, end-to-end encrypted storage service. Get started on your phone.{" "}
                <span className="text-[#3a76f0] hover:underline cursor-pointer">Learn more.</span>
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2 px-1">Other ways to back up</h3>
            <div className="bg-[#1e1e22] rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-start gap-3.5 pr-4">
                <Folder className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-normal text-zinc-200">Desktop backups</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {settings.lastBackupDate
                      ? `Backup active. Last backup created: ${settings.lastBackupDate}`
                      : "Create an end-to-end encrypted backup that you can restore on your phone."}
                  </p>
                </div>
              </div>
              <button
                onClick={generateBackupPassphrase}
                className="px-4 py-1.5 rounded-full bg-[#28282c] hover:bg-[#34343a] text-zinc-200 text-xs font-semibold transition-colors flex-shrink-0"
              >
                {settings.lastBackupDate ? "Manage" : "Set up"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 10: DONATE TO SIGNAL (Screenshot 2: media_1788799742736.png)
      ========================================================================= */}
      {activeSection === "donate" && (
        <div className="max-w-xl mx-auto w-full py-10 px-6 space-y-6 text-center animate-in fade-in duration-150">
          <h2 className="text-center text-zinc-100 font-semibold text-sm tracking-wide">Donate to Signal</h2>

          <div className="flex flex-col items-center pt-2">
            <div className="w-20 h-20 rounded-full bg-[#c9cdd4] text-[#1c1c20] flex items-center justify-center font-bold text-3xl mb-4 shadow-sm">
              {currentUser?.display_name ? currentUser.display_name[0].toUpperCase() : "R"}
            </div>
            <h3 className="text-base font-bold text-white mb-2">Proudly nonprofit</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              Donate to support private messaging. Keep Signal independent and ad-free.{" "}
              <a href="https://signal.org/donate" target="_blank" rel="noreferrer" className="text-[#3a76f0] underline">
                Read more
              </a>
            </p>

            <button
              onClick={() => window.open("https://signal.org/donate", "_blank")}
              className="mt-5 px-7 py-2 rounded-full bg-[#3a76f0] hover:bg-[#2860e6] text-white text-xs font-semibold transition-all shadow-sm"
            >
              Donate
            </button>
          </div>

          <hr className="border-[#26262a] my-8" />

          <div
            onClick={() => window.open("https://support.signal.org/hc/en-us/articles/360031955551-Donor-FAQs", "_blank")}
            className="bg-[#1e1e22] rounded-2xl p-4 flex items-center justify-between hover:bg-[#232328] transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3 text-xs text-zinc-200">
              <HelpCircle className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <span>Donor FAQs</span>
            </div>
            <ExternalLink className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          </div>

          <p className="text-[11px] text-zinc-500 text-left px-1">
            Badges and monthly donations can be managed on your mobile device.
          </p>
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE MODALS
      ========================================================================= */}

      {/* 1. Chat Folders Modal */}
      {isChatFoldersOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1e1e22] border border-[#2e2e36] rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Chat folders</h3>
              <button
                onClick={() => setIsChatFoldersOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#28282e]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              Create folders to organize work, family, or custom chats.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New folder name (e.g. Work)"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="flex-1 bg-[#28282c] border border-[#34343a] text-xs text-white rounded-xl px-3 py-2 focus:outline-hidden focus:border-signal-blue"
              />
              <button
                onClick={() => {
                  if (!newFolderName.trim()) return;
                  const newFolder = {
                    id: `folder-${Date.now()}`,
                    name: newFolderName.trim(),
                  };
                  updateSetting("chatFolders", [...settings.chatFolders, newFolder]);
                  setNewFolderName("");
                  showToast(`Folder "${newFolder.name}" created!`);
                }}
                className="px-3.5 py-2 bg-signal-blue text-white rounded-xl text-xs font-semibold hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pt-2">
              {settings.chatFolders.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500">No chat folders created yet.</div>
              ) : (
                settings.chatFolders.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#26262c] text-xs text-white"
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-signal-blue" />
                      <span>{f.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        updateSetting(
                          "chatFolders",
                          settings.chatFolders.filter((item) => item.id !== f.id)
                        );
                        showToast(`Folder "${f.name}" deleted`);
                      }}
                      className="text-zinc-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsChatFoldersOpen(false)}
                className="w-full py-2 bg-[#28282c] hover:bg-[#323238] text-xs text-white font-medium rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Blocked Users Modal */}
      {isBlockedOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1e1e22] border border-[#2e2e36] rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Blocked contacts</h3>
              <button
                onClick={() => setIsBlockedOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#28282e]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              Blocked people won&apos;t be able to call you or send you messages.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter name or number to block"
                value={newBlockName}
                onChange={(e) => setNewBlockName(e.target.value)}
                className="flex-1 bg-[#28282c] border border-[#34343a] text-xs text-white rounded-xl px-3 py-2 focus:outline-hidden focus:border-red-500"
              />
              <button
                onClick={() => {
                  if (!newBlockName.trim()) return;
                  const item = {
                    id: `block-${Date.now()}`,
                    name: newBlockName.trim(),
                  };
                  updateSetting("blockedUsers", [...settings.blockedUsers, item]);
                  setNewBlockName("");
                  showToast(`${item.name} blocked`);
                }}
                className="px-3.5 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors"
              >
                Block
              </button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pt-2">
              {settings.blockedUsers.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500">No blocked users.</div>
              ) : (
                settings.blockedUsers.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#26262c] text-xs text-white"
                  >
                    <div className="flex items-center gap-2">
                      <Ban className="w-4 h-4 text-red-400" />
                      <span>{b.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        updateSetting(
                          "blockedUsers",
                          settings.blockedUsers.filter((item) => item.id !== b.id)
                        );
                        showToast(`Unblocked ${b.name}`);
                      }}
                      className="text-xs text-signal-blue hover:underline font-medium"
                    >
                      Unblock
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsBlockedOpen(false)}
                className="w-full py-2 bg-[#28282c] hover:bg-[#323238] text-xs text-white font-medium rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Phone Number Privacy Modal */}
      {isPhonePrivacyOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1e1e22] border border-[#2e2e36] rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Phone number privacy</h3>
              <button
                onClick={() => setIsPhonePrivacyOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#28282e]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-zinc-300">Who can see my phone number:</h4>
              <div className="space-y-1.5">
                {["everyone", "nobody"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      updateSetting("phonePrivacy", opt as any);
                      showToast(`Phone privacy set to ${opt}`);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs transition-colors capitalize ${
                      settings.phonePrivacy === opt
                        ? "bg-signal-blue/20 text-signal-blue font-semibold border border-signal-blue/40"
                        : "bg-[#28282c] text-zinc-200 hover:bg-[#323238]"
                    }`}
                  >
                    <span>{opt}</span>
                    {settings.phonePrivacy === opt && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsPhonePrivacyOpen(false)}
                className="w-full py-2 bg-[#28282c] hover:bg-[#323238] text-xs text-white font-medium rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Language Selector Modal */}
      {isLanguageOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1e1e22] border border-[#2e2e36] rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Choose language</h3>
              <button
                onClick={() => setIsLanguageOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#28282e]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 max-h-72 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    updateSetting("language", lang);
                    setIsLanguageOpen(false);
                    showToast(`Language set to ${lang}`);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors text-left ${
                    settings.language === lang
                      ? "bg-signal-blue/20 text-signal-blue font-semibold border border-signal-blue/40"
                      : "text-zinc-200 hover:bg-[#28282c]"
                  }`}
                >
                  <span>{lang}</span>
                  {settings.language === lang && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Notification Profiles Modal */}
      {isNotificationProfilesOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1e1e22] border border-[#2e2e36] rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Notification profiles</h3>
              <button
                onClick={() => setIsNotificationProfilesOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#28282e]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              Customize when you want to receive alerts and notifications.
            </p>

            <div className="space-y-2">
              {notificationProfiles.map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    updateSetting("activeNotificationProfile", p.name);
                    showToast(`Active profile: ${p.name}`);
                  }}
                  className={`w-full flex items-start justify-between p-3 rounded-xl text-left transition-colors ${
                    settings.activeNotificationProfile === p.name
                      ? "bg-signal-blue/20 text-signal-blue border border-signal-blue/40"
                      : "bg-[#28282c] text-zinc-200 hover:bg-[#323238]"
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold text-white">{p.name}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{p.desc}</div>
                  </div>
                  {settings.activeNotificationProfile === p.name && (
                    <Check className="w-4 h-4 text-signal-blue flex-shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsNotificationProfilesOpen(false)}
                className="w-full py-2 bg-[#28282c] hover:bg-[#323238] text-xs text-white font-medium rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Desktop Backup Setup Wizard Modal */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1e1e22] border border-[#2e2e36] rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-5 h-5 text-signal-blue" />
                <h3 className="text-sm font-bold text-white">Signal Desktop Backups</h3>
              </div>
              <button
                onClick={() => setIsBackupModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#28282e]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Desktop backups are encrypted with this 30-digit passphrase. You will need this passphrase to restore your messages.
            </p>

            {/* Passphrase Display */}
            <div className="p-4 rounded-xl bg-[#141417] border border-[#2f2f38] text-center">
              <div className="text-base font-mono font-bold tracking-widest text-emerald-400 select-all">
                {backupGeneratedPassphrase}
              </div>
              <div className="flex justify-center gap-2 mt-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(backupGeneratedPassphrase);
                    showToast("Passphrase copied to clipboard!");
                  }}
                  className="px-3 py-1 bg-[#28282e] hover:bg-[#34343a] text-zinc-200 text-xs rounded-lg transition-colors"
                >
                  Copy passphrase
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([`SIGNAL BACKUP PASSPHRASE:\n${backupGeneratedPassphrase}\n\nKeep this safe.`], {
                      type: "text/plain",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "signal-backup-passphrase.txt";
                    a.click();
                    showToast("Passphrase saved to file!");
                  }}
                  className="px-3 py-1 bg-[#28282e] hover:bg-[#34343a] text-zinc-200 text-xs rounded-lg transition-colors"
                >
                  Save as text file
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={backupConfirmed}
                onChange={(e) => setBackupConfirmed(e.target.checked)}
                className="rounded border-[#34343a] text-signal-blue focus:ring-signal-blue"
              />
              <span>I have saved this 30-digit passphrase in a safe place.</span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsBackupModalOpen(false)}
                className="px-4 py-2 bg-[#28282c] hover:bg-[#34343a] text-xs text-zinc-300 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!backupConfirmed}
                onClick={() => {
                  updateSetting("backupPassphrase", backupGeneratedPassphrase);
                  updateSetting("lastBackupDate", new Date().toLocaleDateString());
                  setIsBackupModalOpen(false);
                  showToast("Desktop backups enabled successfully!");
                }}
                className="px-5 py-2 bg-signal-blue hover:bg-blue-600 text-xs text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                Enable Backups
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Delete Data Confirmation Modal */}
      {isDeleteDataOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1e1e22] border border-[#2e2e36] rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center gap-3 text-red-400">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Delete application data?</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              This will erase all local message cache, settings, and session credentials. You will need to log back in.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeleteDataOpen(false)}
                className="px-4 py-2 bg-[#28282c] hover:bg-[#34343a] text-xs text-zinc-300 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs text-white font-semibold rounded-xl transition-colors"
              >
                Delete everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
