"use client";

import React, { useState } from "react";
import { X, Sparkles, Send, Image as ImageIcon } from "lucide-react";
import { useSignal } from "@/context/SignalContext";

interface StoryCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoryCreatorModal: React.FC<StoryCreatorModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useSignal();
  const [content, setContent] = useState("");
  const [bgGradient, setBgGradient] = useState("from-blue-600 to-indigo-900");

  if (!isOpen) return null;

  const GRADIENTS = [
    "from-blue-600 to-indigo-900",
    "from-purple-600 to-pink-600",
    "from-emerald-600 to-teal-800",
    "from-amber-500 to-rose-600",
    "from-gray-800 to-black",
  ];

  const handlePostStory = () => {
    if (!content.trim()) return;
    alert("Story shared! It will be visible to your contacts for 24 hours.");
    setContent("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-sm bg-[#1a1a1d] border border-[#27272d] rounded-3xl p-6 text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-signal-blue" />
            <h3 className="font-bold text-base">New Story</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Story Card Preview */}
        <div
          className={`w-full h-64 rounded-2xl bg-gradient-to-tr ${bgGradient} p-6 flex flex-col justify-between shadow-inner relative overflow-hidden`}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-xs">
              {currentUser?.display_name ? currentUser.display_name[0] : "R"}
            </div>
            <span className="text-xs font-semibold">{currentUser?.display_name || "My Story"}</span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your story..."
            className="w-full bg-transparent text-white placeholder-white/60 text-base font-semibold focus:outline-hidden resize-none text-center my-auto"
            rows={3}
            autoFocus
          />

          <span className="text-[10px] text-white/60 text-center">Disappears in 24 hours</span>
        </div>

        {/* Gradient Selectors */}
        <div className="flex items-center justify-center gap-2 pt-1">
          {GRADIENTS.map((g, i) => (
            <button
              key={i}
              onClick={() => setBgGradient(g)}
              className={`w-6 h-6 rounded-full bg-gradient-to-tr ${g} border-2 transition-transform ${
                bgGradient === g ? "border-white scale-110" : "border-transparent opacity-70"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handlePostStory}
          disabled={!content.trim()}
          className="w-full py-3 rounded-xl bg-signal-blue hover:bg-signal-blue-hover text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>Share to My Story</span>
        </button>
      </div>
    </div>
  );
};
