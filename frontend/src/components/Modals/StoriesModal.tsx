"use client";

import React from "react";
import { X, Sparkles, Clock, Eye, ShieldCheck } from "lucide-react";

interface StoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoriesModal: React.FC<StoriesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white dark:bg-[#1a1a1e] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden p-6 text-center animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-16 h-16 mx-auto rounded-full bg-linear-to-tr from-signal-blue to-purple-500 p-0.5 mb-4 shadow-lg flex items-center justify-center">
          <div className="w-full h-full bg-white dark:bg-[#1a1a1e] rounded-full flex items-center justify-center text-signal-blue">
            <Sparkles className="w-7 h-7" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Signal Stories</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
          Share images, videos, and text with your contacts that automatically disappear after 24 hours.
        </p>

        <div className="my-6 p-4 rounded-2xl bg-gray-50 dark:bg-[#141416] border border-gray-100 dark:border-gray-800/80 space-y-3 text-left">
          <div className="flex items-center gap-3 text-xs text-gray-700 dark:text-gray-300">
            <ShieldCheck className="w-4 h-4 text-signal-blue flex-shrink-0" />
            <span>End-to-end encrypted like all Signal conversations</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-700 dark:text-gray-300">
            <Clock className="w-4 h-4 text-purple-500 flex-shrink-0" />
            <span>Disappears after 24 hours</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-700 dark:text-gray-300">
            <Eye className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Choose exactly who can see each story</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-signal-blue hover:bg-signal-blue-hover text-white text-sm font-medium transition-colors"
        >
          Got It
        </button>
      </div>
    </div>
  );
};
