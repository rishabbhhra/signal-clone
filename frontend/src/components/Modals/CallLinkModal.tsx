"use client";

import React, { useState } from "react";
import { X, Link as LinkIcon, Copy, Check, Video, Share2 } from "lucide-react";

interface CallLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinCall: () => void;
}

export const CallLinkModal: React.FC<CallLinkModalProps> = ({
  isOpen,
  onClose,
  onJoinCall,
}) => {
  const [copied, setCopied] = useState(false);
  const callLink = "https://signal.group/#call/sec-call-9948271";

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(callLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-sm bg-[#1c1c20] border border-[#2a2a30] rounded-3xl p-6 text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-signal-blue" />
            <h3 className="font-bold text-base">Call Link</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          Anyone with this link can join this end-to-end encrypted video call.
        </p>

        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#242428] border border-[#2e2e36]">
          <span className="text-xs font-mono text-gray-300 truncate flex-1">{callLink}</span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-[#2e2e36] hover:bg-[#383842] text-gray-200 transition-colors"
            title="Copy link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 rounded-xl bg-[#28282e] hover:bg-[#32323a] text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? "Copied!" : "Copy Link"}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onJoinCall();
            }}
            className="flex-1 py-2.5 rounded-xl bg-signal-blue hover:bg-signal-blue-hover text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <Video className="w-4 h-4" />
            <span>Start Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
