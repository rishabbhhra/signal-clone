"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  Clock,
  Shield,
  Trash2,
  LogOut,
  ChevronDown,
  Crown,
  UserMinus,
} from "lucide-react";
import { useSignal } from "@/context/SignalContext";
import { Avatar } from "@/components/Avatar";
import { api } from "@/lib/api";
import { UserBrief } from "@/types";

interface GroupInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSafetyNumber: (userId: string, name: string) => void;
}

export const GroupInfoDrawer: React.FC<GroupInfoDrawerProps> = ({
  isOpen,
  onClose,
  onOpenSafetyNumber,
}) => {
  const {
    activeConversation,
    currentUser,
    updateDisappearingTimer,
    addMemberToGroup,
    removeMemberFromGroup,
  } = useSignal();

  const [isAddingMember, setIsAddingMember] = useState(false);
  const [candidateUsers, setCandidateUsers] = useState<UserBrief[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");

  useEffect(() => {
    if (!isOpen || !activeConversation) return;
    api.searchUsers("").then((users) => {
      const existingMemberIds = activeConversation.participants.map((p) => p.user_id);
      setCandidateUsers(users.filter((u) => !existingMemberIds.includes(u.id)));
    });
  }, [isOpen, activeConversation]);

  if (!isOpen || !activeConversation) return null;

  const isGroup = activeConversation.type === "group";
  const myParticipant = activeConversation.participants.find((p) => p.user_id === currentUser?.id);
  const isAdmin = isGroup && (myParticipant?.role === "admin" || activeConversation.created_by === currentUser?.id);

  const handleDisappearingChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const secs = parseInt(e.target.value, 10);
    await updateDisappearingTimer(activeConversation.id, secs);
  };

  const handleAddMember = async () => {
    if (!selectedCandidateId) return;
    try {
      await addMemberToGroup(activeConversation.id, selectedCandidateId);
      setIsAddingMember(false);
      setSelectedCandidateId("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await removeMemberFromGroup(activeConversation.id, userId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLeaveGroup = async () => {
    if (!currentUser) return;
    if (!confirm("Leave this group?")) return;
    try {
      await removeMemberFromGroup(activeConversation.id, currentUser.id);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const directUser = activeConversation.direct_recipient;

  return (
    <div className="w-80 md:w-88 h-full bg-white dark:bg-[#1a1a1e] border-l border-gray-200 dark:border-gray-800 flex flex-col z-20 shadow-xl overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
          {isGroup ? "Group Details" : "Contact Info"}
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Profile Card */}
        <div className="flex flex-col items-center text-center">
          <Avatar
            name={isGroup ? activeConversation.name || "Group" : directUser?.display_name || "Contact"}
            url={isGroup ? activeConversation.avatar_url : directUser?.avatar_url}
            size="xl"
            isOnline={!isGroup && directUser?.is_online}
            showOnlineBadge={!isGroup}
          />
          <h4 className="mt-3 font-bold text-lg text-gray-900 dark:text-gray-100">
            {isGroup ? activeConversation.name : directUser?.display_name}
          </h4>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            {isGroup ? `${activeConversation.participants.length} members` : `@${directUser?.username}`}
          </p>
        </div>

        {/* Disappearing Messages Settings */}
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#151518] border border-gray-100 dark:border-gray-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <Clock className="w-4 h-4 text-signal-blue" />
            <span>Disappearing Messages</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-tight">
            Messages disappear from this chat for everyone after they are read.
          </p>
          <div className="pt-2">
            <select
              value={activeConversation.disappearing_seconds}
              onChange={handleDisappearingChange}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#202025] text-xs text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 focus:outline-hidden focus:ring-1 focus:ring-signal-blue"
            >
              <option value="0">Off</option>
              <option value="10">10 seconds</option>
              <option value="60">1 minute</option>
              <option value="3600">1 hour</option>
              <option value="86400">1 day</option>
              <option value="604800">1 week</option>
            </select>
          </div>
        </div>

        {/* Encryption / Safety Number */}
        {!isGroup && directUser && (
          <button
            onClick={() => onOpenSafetyNumber(directUser.id, directUser.display_name)}
            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#151518] border border-gray-100 dark:border-gray-800/80 hover:bg-gray-100 dark:hover:bg-[#1f1f24] transition-colors flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-signal-blue" />
              <div>
                <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                  Verify Safety Number
                </div>
                <div className="text-[11px] text-gray-500">Signal Simulated Cryptography</div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
          </button>
        )}

        {/* Group Members Section */}
        {isGroup && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Members ({activeConversation.participants.length})
              </span>
              {isAdmin && (
                <button
                  onClick={() => setIsAddingMember(!isAddingMember)}
                  className="text-xs text-signal-blue font-medium hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Add
                </button>
              )}
            </div>

            {/* Add member inline dropdown */}
            {isAddingMember && (
              <div className="p-3 bg-gray-50 dark:bg-[#151518] rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                <select
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#202025] text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700"
                >
                  <option value="">Choose contact to add...</option>
                  {candidateUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.display_name} (@{u.username})
                    </option>
                  ))}
                </select>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingMember(false)}
                    className="px-2.5 py-1 text-xs text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    disabled={!selectedCandidateId}
                    className="px-3 py-1 text-xs bg-signal-blue text-white rounded-lg disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Member list */}
            <div className="space-y-1.5">
              {activeConversation.participants.map((p) => {
                const isMemberAdmin = p.role === "admin" || activeConversation.created_by === p.user_id;
                const isMe = p.user_id === currentUser?.id;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-[#151518] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar
                        name={p.user.display_name}
                        url={p.user.avatar_url}
                        size="sm"
                        isOnline={p.user.is_online}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1 truncate">
                          <span>{p.user.display_name}</span>
                          {isMe && <span className="text-gray-400">(You)</span>}
                        </div>
                        <p className="text-[10px] text-gray-400 truncate">@{p.user.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isMemberAdmin && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full font-medium">
                          <Crown className="w-3 h-3" /> Admin
                        </span>
                      )}
                      {isAdmin && !isMe && (
                        <button
                          onClick={() => handleRemoveMember(p.user_id)}
                          title="Remove from group"
                          className="p-1 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Leave Group */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={handleLeaveGroup}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Leave Group</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
