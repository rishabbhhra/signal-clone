"use client";

import React, { useState } from "react";
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
  Heart,
  Archive,
  PieChart,
  HardDrive,
  Download,
  Upload,
} from "lucide-react";
import { SettingsSection } from "./SubSidebar";
import { useSignal } from "@/context/SignalContext";

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
    theme,
    toggleTheme,
  } = useSignal();

  // Profile Edit State
  const [firstName, setFirstName] = useState(currentUser?.display_name || "Rishabh");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [username, setUsername] = useState(currentUser?.username || "");
  const [profileSaved, setProfileSaved] = useState(false);

  // General Settings State
  const [openAtLogin, setOpenAtLogin] = useState(false);
  const [micPermission, setMicPermission] = useState(true);
  const [camPermission, setCamPermission] = useState(true);
  const [deviceName, setDeviceName] = useState("macOS");

  // Appearance Settings State (Screenshot 5)
  const [selectedTheme, setSelectedTheme] = useState("System");
  const [chatColor, setChatColor] = useState("#2c6bed");
  const [zoomLevel, setZoomLevel] = useState("100%");
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Chats Settings State (Screenshot 1)
  const [useAddressBookPhotos, setUseAddressBookPhotos] = useState(false);
  const [keepMutedArchived, setKeepMutedArchived] = useState(false);
  const [spellCheck, setSpellCheck] = useState(true);
  const [showFormattingPopover, setShowFormattingPopover] = useState(true);
  const [generateLinkPreviews, setGenerateLinkPreviews] = useState(true);
  const [convertEmoticons, setConvertEmoticons] = useState(true);
  const [selectedSkinTone, setSelectedSkinTone] = useState(0);

  // Calls Settings State (Screenshot 2)
  const [enableIncomingCalls, setEnableIncomingCalls] = useState(true);
  const [playCallingSounds, setPlayCallingSounds] = useState(true);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState("FaceTime HD Camera (C4E1:9BFB)");
  const [selectedMicDevice, setSelectedMicDevice] = useState("Default (Airdopes 161)");
  const [selectedSpeakerDevice, setSelectedSpeakerDevice] = useState("Default (Airdopes 161)");
  const [alwaysRelayCalls, setAlwaysRelayCalls] = useState(false);

  // Notifications Settings State (Screenshot 3)
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [showCallNotifications, setShowCallNotifications] = useState(true);
  const [reactionNotifications, setReactionNotifications] = useState(true);
  const [notificationContent, setNotificationContent] = useState("Name, content, and actions");
  const [pushNotificationSounds, setPushNotificationSounds] = useState(false);
  const [inChatMessageSounds, setInChatMessageSounds] = useState(false);
  const [includeMutedInBadge, setIncludeMutedInBadge] = useState(false);

  // Privacy Settings State (Screenshot 4)
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState(true);
  const [defaultDisappearingTimer, setDefaultDisappearingTimer] = useState("Off");
  const [sealedSenderIcon, setSealedSenderIcon] = useState(false);
  const [autoKeyVerification, setAutoKeyVerification] = useState(true);

  // Data Usage State
  const [autoDownloadPhotos, setAutoDownloadPhotos] = useState(true);
  const [autoDownloadAudio, setAutoDownloadAudio] = useState(true);
  const [autoDownloadVideo, setAutoDownloadVideo] = useState(true);
  const [autoDownloadDocs, setAutoDownloadDocs] = useState(true);

  // Backups State
  const [backupEnabled, setBackupEnabled] = useState(false);

  const skinTones = ["✋", "✋🏻", "✋🏼", "✋🏽", "✋🏾", "✋🏿"];
  const chatColors = [
    { name: "Signal Blue", hex: "#2c6bed" },
    { name: "Ultramarine", hex: "#3b5998" },
    { name: "Crimson", hex: "#e11d48" },
    { name: "Emerald", hex: "#10b981" },
    { name: "Amber", hex: "#f59e0b" },
    { name: "Purple", hex: "#8b5cf6" },
  ];

  const handleSaveProfile = async () => {
    try {
      const full = lastName.trim() ? `${firstName.trim()} ${lastName.trim()}` : firstName.trim();
      await updateProfile({
        display_name: full,
        bio: bio.trim(),
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 h-full bg-[#121214] overflow-y-auto select-none">
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
              <SignalSwitch checked={useAddressBookPhotos} onChange={setUseAddressBookPhotos} />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="pr-4">
                <h4 className="text-xs font-normal text-zinc-200">Keep muted chats archived</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Muted chats that are archived will remain archived when a new message arrives.</p>
              </div>
              <SignalSwitch checked={keepMutedArchived} onChange={setKeepMutedArchived} />
            </div>
          </div>

          {/* Section: Text input */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2 px-1">Text input</h3>
            <div className="bg-[#1e1e22] rounded-2xl p-4 divide-y divide-[#28282e]">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-normal text-zinc-200">Spell check text entered in message composition box</span>
                <SignalSwitch checked={spellCheck} onChange={setSpellCheck} />
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-normal text-zinc-200">Show text formatting popover when text is selected</span>
                <SignalSwitch checked={showFormattingPopover} onChange={setShowFormattingPopover} />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="pr-4">
                  <h4 className="text-xs font-normal text-zinc-200">Generate link previews</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Retrieve link previews directly from websites for messages you send.</p>
                </div>
                <SignalSwitch checked={generateLinkPreviews} onChange={setGenerateLinkPreviews} />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="pr-4">
                  <h4 className="text-xs font-normal text-zinc-200">Convert typed emoticons to emoji</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">For example, :-) will be converted to 🙂</p>
                </div>
                <SignalSwitch checked={convertEmoticons} onChange={setConvertEmoticons} />
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-xs font-normal text-zinc-200">Emoji skin tone</span>
                <div className="flex items-center gap-1.5">
                  {skinTones.map((tone, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSkinTone(idx)}
                      className={`text-base p-1 rounded-lg transition-all ${
                        selectedSkinTone === idx
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
            <div className="bg-[#1e1e22] rounded-2xl p-4 flex items-center justify-between hover:bg-[#232328] transition-colors cursor-pointer">
              <div>
                <h4 className="text-xs font-normal text-zinc-200">Add a chat folder</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Organize your chats into folders and quickly switch between them on your chat list.</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            </div>
          </div>

          {/* Card 4: Export chat history */}
          <div className="bg-[#1e1e22] rounded-2xl p-4 flex items-center justify-between">
            <div className="pr-4">
              <h4 className="text-xs font-normal text-zinc-200">Export chat history</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">Export a machine-readable JSON copy of all your chats. Disappearing messages will not be exported.</p>
            </div>
            <button
              onClick={() => {
                const data = JSON.stringify({ exported_at: new Date().toISOString(), chats: [] }, null, 2);
                const blob = new Blob([data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "signal-chats-export.json";
                a.click();
              }}
              className="px-4 py-1.5 rounded-lg bg-[#28282c] hover:bg-[#34343a] text-zinc-200 text-xs font-medium transition-colors flex-shrink-0"
            >
              Export
            </button>
          </div>

          {/* Card 5: Import contacts */}
          <div className="bg-[#1e1e22] rounded-2xl p-4 flex items-center justify-between">
            <div className="pr-4">
              <h4 className="text-xs font-normal text-zinc-200">Import contacts</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">Import all Signal groups and contacts from your mobile device. Last import at 9/7/2026 5:10:11 PM</p>
            </div>
            <button
              onClick={() => alert("Contacts synced from mobile device successfully.")}
              className="px-4 py-1.5 rounded-lg bg-[#28282c] hover:bg-[#34343a] text-zinc-200 text-xs font-medium transition-colors flex-shrink-0"
            >
              Import now
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
              <SignalSwitch checked={enableIncomingCalls} onChange={setEnableIncomingCalls} />
            </div>
            <div className="flex items-center justify-between pt-3">
              <span className="text-xs font-normal text-zinc-200">Play calling sounds</span>
              <SignalSwitch checked={playCallingSounds} onChange={setPlayCallingSounds} />
            </div>
          </div>

          {/* Section: Devices */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2 px-1">Devices</h3>
            <div className="bg-[#1e1e22] rounded-2xl p-4 divide-y divide-[#28282e]">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-normal text-zinc-200">Video</span>
                <SignalSelect
                  value={selectedVideoDevice}
                  onChange={setSelectedVideoDevice}
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
                  value={selectedMicDevice}
                  onChange={setSelectedMicDevice}
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
                  value={selectedSpeakerDevice}
                  onChange={setSelectedSpeakerDevice}
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
                <SignalSwitch checked={alwaysRelayCalls} onChange={setAlwaysRelayCalls} />
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
              <SignalSwitch checked={enableNotifications} onChange={setEnableNotifications} />
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-xs font-normal text-zinc-200">Show notifications for calls</span>
              <SignalSwitch checked={showCallNotifications} onChange={setShowCallNotifications} />
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="pr-4">
                <h4 className="text-xs font-normal text-zinc-200">Reaction notifications</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Notify when someone reacts to your message</p>
              </div>
              <SignalSwitch checked={reactionNotifications} onChange={setReactionNotifications} />
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-xs font-normal text-zinc-200">Notification content</span>
              <SignalSelect
                value={notificationContent}
                onChange={setNotificationContent}
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
                <SignalSwitch checked={pushNotificationSounds} onChange={setPushNotificationSounds} />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div className="pr-4">
                  <h4 className="text-xs font-normal text-zinc-200">In-chat message sounds</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Hear a notification sound for sent and received messages while in the chat.</p>
                </div>
                <SignalSwitch checked={inChatMessageSounds} onChange={setInChatMessageSounds} />
              </div>
            </div>
          </div>

          {/* Section: App badge */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2 px-1">App badge</h3>
            <div className="bg-[#1e1e22] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-normal text-zinc-200">Include muted chats in badge count</span>
                <SignalSwitch checked={includeMutedInBadge} onChange={setIncludeMutedInBadge} />
              </div>
            </div>
          </div>

          {/* Card 4: Notification profiles */}
          <div className="bg-[#1e1e22] rounded-2xl p-4 flex items-center justify-between hover:bg-[#232328] transition-colors cursor-pointer">
            <div>
              <h4 className="text-xs font-normal text-zinc-200">Notification profiles</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">Add or edit notification profiles</p>
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
          <div className="bg-[#1e1e22] rounded-2xl p-4 flex items-center justify-between hover:bg-[#232328] transition-colors cursor-pointer">
            <div>
              <h4 className="text-xs font-normal text-zinc-200">Phone Number</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">Choose who can see your phone number and who can contact you on Signal with it.</p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          </div>

          {/* Card 2: Blocked */}
          <div className="bg-[#1e1e22] rounded-2xl p-4 flex items-center justify-between hover:bg-[#232328] transition-colors cursor-pointer">
            <div>
              <h4 className="text-xs font-normal text-zinc-200">Blocked</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">No users or groups</p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          </div>

          {/* Section: Messaging */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2 px-1">Messaging</h3>
            <div className="bg-[#1e1e22] rounded-2xl p-4 divide-y divide-[#28282e]">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-normal text-zinc-200">Read receipts</span>
                <SignalSwitch checked={readReceipts} onChange={setReadReceipts} />
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-xs font-normal text-zinc-200">Typing indicators</span>
                <SignalSwitch checked={typingIndicators} onChange={setTypingIndicators} />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2 px-1 leading-relaxed">
              See and share when message are being read and typed. If disabled, you won&apos;t see read receipts or typing indicators from others.
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
                value={defaultDisappearingTimer}
                onChange={setDefaultDisappearingTimer}
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
                <p className="text-[11px] text-zinc-400 mt-0.5">If you opt out of stories you will no longer be able to share or view stories.</p>
              </div>
              <button
                onClick={() => alert("You will no longer share or receive stories.")}
                className="px-3.5 py-1.5 rounded-lg bg-[#391d22] hover:bg-[#482228] text-[#f87171] text-xs font-medium transition-colors flex-shrink-0"
              >
                Turn off stories
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
                <SignalSwitch checked={sealedSenderIcon} onChange={setSealedSenderIcon} />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div className="pr-4">
                  <h4 className="text-xs font-normal text-zinc-200">Automatic key verification</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    When enabled, Signal will attempt to automatically verify the encryption of 1:1 chats.{" "}
                    <span className="text-[#3a76f0] hover:underline cursor-pointer">Learn More</span>
                  </p>
                </div>
                <SignalSwitch checked={autoKeyVerification} onChange={setAutoKeyVerification} />
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
            <div className="flex items-center justify-between pb-3 cursor-pointer hover:opacity-90 transition-opacity">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-zinc-300" />
                <span className="text-xs font-normal text-zinc-200">Language</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span>System Language</span>
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
                value={selectedTheme}
                onChange={(val) => {
                  setSelectedTheme(val);
                  if (val === "Dark" && theme !== "dark") toggleTheme();
                  if (val === "Light" && theme !== "light") toggleTheme();
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
                  style={{ backgroundColor: chatColor }}
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
                        setChatColor(c.hex);
                        setShowColorPicker(false);
                      }}
                      className="w-6 h-6 rounded-full transition-transform hover:scale-110 flex items-center justify-center text-white"
                      style={{ backgroundColor: c.hex }}
                    >
                      {chatColor === c.hex && <Check className="w-3.5 h-3.5 stroke-[3]" />}
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
                value={zoomLevel}
                onChange={setZoomLevel}
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
          VIEW 6: PROFILE (Screenshot 4 from previous session)
      ========================================================================= */}
      {activeSection === "profile" && (
        <div className="max-w-xl mx-auto w-full py-12 px-6 space-y-8 animate-in fade-in duration-150">
          <h2 className="text-center text-white font-semibold text-base">Profile</h2>

          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-[#c9cdd4] text-[#1c1c20] flex items-center justify-center font-bold text-3xl mb-3 shadow-lg">
              {currentUser?.display_name ? currentUser.display_name[0].toUpperCase() : "R"}
            </div>
            <button
              onClick={() => {
                const name = prompt("Enter new display name:", firstName);
                if (name) {
                  setFirstName(name);
                  updateProfile({ display_name: name });
                }
              }}
              className="px-4 py-1.5 rounded-full bg-[#26262b] hover:bg-[#323238] text-xs font-semibold text-gray-200 transition-colors"
            >
              Edit photo
            </button>
          </div>

          {/* Profile Name & About Fields */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Profile name</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={handleSaveProfile}
                  className="bg-[#1e1e22] border border-[#27272c] rounded-xl text-white font-medium focus:outline-hidden focus:border-[#3a76f0] px-3.5 py-2 text-sm"
                  placeholder="First name (required)"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={handleSaveProfile}
                  className="bg-[#1e1e22] border border-[#27272c] rounded-xl text-white font-medium focus:outline-hidden focus:border-[#3a76f0] px-3.5 py-2 text-sm"
                  placeholder="Last name (optional)"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">About</label>
              <div className="bg-[#1e1e22] border border-[#27272c] rounded-xl p-3">
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  onBlur={handleSaveProfile}
                  className="bg-transparent text-gray-300 focus:outline-hidden w-full text-sm"
                  placeholder="Write a few words about yourself"
                />
              </div>
            </div>

            <p className="text-xs text-zinc-500 px-1 leading-relaxed">
              Your profile and changes to it will be visible to people you message, contacts and groups.
            </p>

            <hr className="border-[#242428] my-6" />

            {/* Username Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 block mb-1">@ Username</label>
              <div className="flex items-center gap-2 bg-[#1e1e22] border border-[#27272c] rounded-xl px-3.5 py-2">
                <span className="text-zinc-500 font-bold text-sm">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-hidden flex-1 text-sm"
                  placeholder="username"
                />
              </div>
              <p className="text-xs text-zinc-500 px-1 leading-relaxed mt-1">
                People can now message you using your optional username so you don&apos;t have to give out your phone number.
              </p>
            </div>

            {profileSaved && (
              <p className="text-xs text-emerald-400 font-medium text-center">Changes saved!</p>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 7: GENERAL (Screenshot 5 from previous session)
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
                <span className="text-gray-400">{deviceName}</span>
                <button
                  onClick={() => {
                    const n = prompt("Change device name:", deviceName);
                    if (n) setDeviceName(n);
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
              <SignalSwitch checked={openAtLogin} onChange={setOpenAtLogin} />
            </div>
          </div>

          {/* Card 3: Permissions */}
          <div className="p-4 rounded-2xl bg-[#1e1e22] border border-[#27272c] space-y-3">
            <h4 className="text-xs font-semibold text-gray-300">Permissions</h4>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Allow access to the microphone</span>
              <SignalSwitch checked={micPermission} onChange={setMicPermission} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Allow access to the camera</span>
              <SignalSwitch checked={camPermission} onChange={setCamPermission} />
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
              onClick={() => alert("Signal is currently on the latest version (7.42.0).")}
              className="px-3.5 py-1.5 rounded-lg bg-[#28282c] hover:bg-[#34343a] text-zinc-200 text-xs font-medium transition-colors"
            >
              Check for updates
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
              onClick={() => {
                if (confirm("Are you sure you want to delete all local application data?")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-[#331c1e] hover:bg-[#422225] text-red-400 text-xs font-semibold transition-colors flex-shrink-0"
            >
              Delete data
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 8: DATA USAGE
      ========================================================================= */}
      {activeSection === "data_usage" && (
        <div className="max-w-2xl mx-auto w-full py-10 px-6 space-y-6 animate-in fade-in duration-150">
          <h2 className="text-center text-zinc-100 font-semibold text-sm tracking-wide">Data usage</h2>

          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2 px-1">Media auto-download</h3>
            <div className="bg-[#1e1e22] rounded-2xl p-4 divide-y divide-[#28282e]">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-normal text-zinc-200">Photos</span>
                <SignalSwitch checked={autoDownloadPhotos} onChange={setAutoDownloadPhotos} />
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-normal text-zinc-200">Audio</span>
                <SignalSwitch checked={autoDownloadAudio} onChange={setAutoDownloadAudio} />
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-normal text-zinc-200">Video</span>
                <SignalSwitch checked={autoDownloadVideo} onChange={setAutoDownloadVideo} />
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-xs font-normal text-zinc-200">Documents</span>
                <SignalSwitch checked={autoDownloadDocs} onChange={setAutoDownloadDocs} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 9: BACKUPS
      ========================================================================= */}
      {activeSection === "backups" && (
        <div className="max-w-2xl mx-auto w-full py-10 px-6 space-y-6 animate-in fade-in duration-150">
          <h2 className="text-center text-zinc-100 font-semibold text-sm tracking-wide">Backups</h2>

          <div className="bg-[#1e1e22] rounded-2xl p-4 divide-y divide-[#28282e]">
            <div className="flex items-center justify-between pb-3">
              <div className="pr-4">
                <h4 className="text-xs font-normal text-zinc-200">Chat backups</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Backups are encrypted with a 30-digit passphrase.</p>
              </div>
              <SignalSwitch checked={backupEnabled} onChange={setBackupEnabled} />
            </div>

            {backupEnabled && (
              <div className="pt-3 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Passphrase:</span>
                  <span className="font-mono text-zinc-200 tracking-wider">84729 19284 81928 47291 93821 04928</span>
                </div>
                <button
                  onClick={() => alert("Backup export initiated.")}
                  className="w-full py-2 bg-[#28282c] hover:bg-[#34343a] text-zinc-200 text-xs rounded-xl font-medium transition-colors"
                >
                  Create Backup Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 10: DONATE TO SIGNAL
      ========================================================================= */}
      {activeSection === "donate" && (
        <div className="max-w-xl mx-auto w-full py-12 px-6 space-y-6 text-center animate-in fade-in duration-150">
          <div className="w-16 h-16 rounded-full bg-[#2a1b24] text-[#f43f5e] flex items-center justify-center mx-auto mb-2">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <h2 className="text-white font-bold text-lg">Donate to Signal</h2>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Signal is a 501(c)(3) nonprofit. We don’t do ads, track users, or sell data. Your donations keep independent, encrypted communication alive.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-4">
            {["$3 / month", "$5 / month", "$10 / month"].map((tier) => (
              <button
                key={tier}
                onClick={() => alert(`Thank you for pledging support with ${tier}!`)}
                className="py-3 px-2 rounded-2xl bg-[#1e1e22] hover:bg-[#28282c] border border-[#28282e] hover:border-[#3a76f0] text-xs font-semibold text-zinc-200 transition-all cursor-pointer"
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
