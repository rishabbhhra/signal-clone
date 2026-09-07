"use client";

import React from "react";
import { X, Smartphone, Monitor, Plus, CheckCircle2, Laptop } from "lucide-react";

interface LinkedDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LinkedDevicesModal: React.FC<LinkedDevicesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1a1a1e] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <Monitor className="w-5 h-5 text-signal-blue" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">Linked Devices</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* QR Code link prompt */}
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-center gap-4">
            <div className="w-16 h-16 bg-white dark:bg-[#141416] rounded-xl p-1.5 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full border border-black dark:border-white p-1 grid grid-cols-4 grid-rows-4 gap-0.5">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`${(i * 3) % 2 === 0 ? "bg-black dark:bg-white" : "bg-transparent"}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Link New Device</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Scan QR code with your phone to sync messages seamlessly.
              </p>
            </div>
          </div>

          {/* Currently Linked Devices List */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Active Sessions
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-[#161619] border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-signal-blue" />
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">Signal Web / Desktop</h5>
                    <p className="text-xs text-gray-500">Active Now • macOS</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> This Device
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-[#161619] border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-purple-500" />
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">Signal for iPhone</h5>
                    <p className="text-xs text-gray-500">Linked 4 days ago • iOS 18</p>
                  </div>
                </div>
                <button className="text-xs text-red-500 hover:text-red-600 font-medium">
                  Unlink
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161619]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-signal-blue hover:bg-signal-blue-hover text-white text-sm font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
