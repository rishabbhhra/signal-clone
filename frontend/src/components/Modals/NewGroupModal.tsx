"use client";

import React, { useState, useEffect } from "react";
import { X, Users, Check, Camera } from "lucide-react";
import { useSignal } from "@/context/SignalContext";
import { api } from "@/lib/api";
import { Avatar } from "@/components/Avatar";
import { UserBrief } from "@/types";

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewGroupModal: React.FC<NewGroupModalProps> = ({ isOpen, onClose }) => {
  const { createGroup } = useSignal();
  const [groupName, setGroupName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserBrief[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setGroupName("");
      setSelectedUserIds([]);
      setError("");
      return;
    }
    api.searchUsers("")
      .then(setAvailableUsers)
      .catch(console.error);
  }, [isOpen]);

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError("Please enter a group name");
      return;
    }
    if (selectedUserIds.length === 0) {
      setError("Please select at least one group member");
      return;
    }

    setIsCreating(true);
    setError("");
    try {
      const avatarUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(groupName.trim())}`;
      await createGroup(groupName.trim(), selectedUserIds, avatarUrl);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1c1c1f] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-signal-blue" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">New Group</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreateGroup} className="flex-1 flex flex-col overflow-hidden">
          {/* Group Details */}
          <div className="p-4 space-y-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#26262a] flex items-center justify-center text-gray-400 border border-gray-200 dark:border-gray-700">
                <Camera className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Group Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-[#141417] text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 border border-transparent focus:border-signal-blue focus:outline-hidden"
                  autoFocus
                  required
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          {/* Members Checklist */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between">
              <span>Select Members</span>
              <span>{selectedUserIds.length} selected</span>
            </div>

            {availableUsers.map((user) => {
              const isSelected = selectedUserIds.includes(user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#25252a] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={user.display_name} url={user.avatar_url} size="md" isOnline={user.is_online} />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.display_name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-signal-blue border-signal-blue text-white"
                        : "border-gray-300 dark:border-gray-600 bg-transparent"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Submit Button */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161619]">
            <button
              type="submit"
              disabled={isCreating || !groupName.trim() || selectedUserIds.length === 0}
              className="w-full py-2.5 px-4 rounded-xl bg-signal-blue hover:bg-signal-blue-hover text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-xs"
            >
              {isCreating ? "Creating Group..." : `Create Group (${selectedUserIds.length} members)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
