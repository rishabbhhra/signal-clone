"use client";

import React, { useState, useEffect } from "react";
import { X, Search, UserPlus, Users, MessageSquarePlus } from "lucide-react";
import { useSignal } from "@/context/SignalContext";
import { api } from "@/lib/api";
import { Avatar } from "@/components/Avatar";
import { UserBrief } from "@/types";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewGroup: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onOpenNewGroup,
}) => {
  const { selectOrStartDirectChat, refreshContacts } = useSignal();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserBrief[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addContactPhone, setAddContactPhone] = useState("");
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contactError, setContactError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setContactError("");
      return;
    }
    // Load initial users
    setIsSearching(true);
    api.searchUsers("")
      .then(setSearchResults)
      .catch(console.error)
      .finally(() => setIsSearching(false));
  }, [isOpen]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    api.searchUsers(query)
      .then(setSearchResults)
      .catch(console.error)
      .finally(() => setIsSearching(false));
  };

  const handleSelectUser = async (userId: string) => {
    await selectOrStartDirectChat(userId);
    onClose();
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addContactPhone.trim()) return;
    setIsAddingContact(true);
    setContactError("");
    try {
      const added = await api.addContact(addContactPhone.trim());
      await refreshContacts();
      await selectOrStartDirectChat(added.contact_user.id);
      onClose();
    } catch (err: any) {
      setContactError(err.message || "Failed to add contact");
    } finally {
      setIsAddingContact(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1c1c1f] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-signal-blue" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">New Chat</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions */}
        <div className="p-4 space-y-3 border-b border-gray-100 dark:border-gray-800">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, @username, or phone"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-[#141417] text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 border border-transparent focus:border-signal-blue focus:outline-hidden"
              autoFocus
            />
          </div>

          {/* New Group Button */}
          <button
            onClick={() => {
              onClose();
              onOpenNewGroup();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-signal-blue hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <Users className="w-4 h-4 text-signal-blue" />
            </div>
            <span>New Group</span>
          </button>
        </div>

        {/* User Search Results */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Contacts & Users
          </div>

          {isSearching ? (
            <div className="py-8 text-center text-sm text-gray-400">Searching users...</div>
          ) : searchResults.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">No users found</div>
          ) : (
            searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user.id)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#25252a] text-left transition-colors"
              >
                <Avatar name={user.display_name} url={user.avatar_url} size="md" isOnline={user.is_online} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.display_name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Add Contact by Phone/Username directly */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161619]">
          <form onSubmit={handleAddContact} className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Or enter phone (+1...) / username"
                value={addContactPhone}
                onChange={(e) => setAddContactPhone(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f1f23] text-xs text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-signal-blue"
              />
              <button
                type="submit"
                disabled={isAddingContact || !addContactPhone.trim()}
                className="px-3 py-2 rounded-xl bg-signal-blue hover:bg-signal-blue-hover text-white text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            {contactError && <p className="text-[11px] text-red-500">{contactError}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};
