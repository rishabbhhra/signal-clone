"use client";

import React, { useState, useEffect } from "react";
import { X, ShieldCheck, QrCode, CheckCircle2, Lock } from "lucide-react";
import { api } from "@/lib/api";

interface SafetyNumberModalProps {
  contactUserId: string;
  contactName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyNumberModal: React.FC<SafetyNumberModalProps> = ({
  contactUserId,
  contactName,
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<{
    safety_number: string;
    encryption_protocol: string;
  } | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !contactUserId) return;
    setLoading(true);
    api.getSafetyNumber(contactUserId)
      .then((res) => {
        setData(res);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isOpen, contactUserId]);

  if (!isOpen) return null;

  // Split into 12 5-digit segments
  const segments = data?.safety_number ? data.safety_number.split(" ") : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1f1f23] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-signal-blue flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">Verify Safety Number</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">with {contactName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            To verify that your end-to-end encryption is secure with <span className="font-semibold">{contactName}</span>, compare the numbers below with their device or scan their QR code.
          </p>

          {/* QR Code Mockup */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-xl shadow-inner border border-gray-200 flex flex-col items-center">
              <div className="w-36 h-36 border-4 border-black p-2 flex flex-wrap gap-1 bg-white relative">
                {/* Simulated QR Pattern */}
                <div className="absolute top-2 left-2 w-7 h-7 bg-black border-2 border-white" />
                <div className="absolute top-2 right-2 w-7 h-7 bg-black border-2 border-white" />
                <div className="absolute bottom-2 left-2 w-7 h-7 bg-black border-2 border-white" />
                <div className="w-full h-full grid grid-cols-6 grid-rows-6 gap-1 p-3 opacity-80">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`${
                        (i * 7) % 3 === 0 ? "bg-black" : "bg-transparent"
                      } rounded-xs`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-gray-500 font-mono mt-2 flex items-center gap-1">
                <Lock className="w-3 h-3 text-signal-blue" />
                Signal Double Ratchet E2E
              </span>
            </div>
          </div>

          {/* Safety Number Grid (12 5-digit blocks) */}
          <div className="bg-gray-50 dark:bg-[#161619] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
            {loading ? (
              <div className="py-6 text-center text-sm text-gray-400">Loading safety number...</div>
            ) : (
              <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs tracking-wider text-gray-800 dark:text-gray-200">
                {segments.map((seg, i) => (
                  <div key={i} className="bg-white dark:bg-[#222227] py-1.5 px-1 rounded shadow-xs border border-gray-100 dark:border-gray-700/50 font-medium">
                    {seg}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verify Toggle */}
          <button
            onClick={() => setIsVerified(!isVerified)}
            className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition-all shadow-xs ${
              isVerified
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-signal-blue hover:bg-signal-blue-hover text-white"
            }`}
          >
            {isVerified ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Verified as Secure
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Mark as Verified
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
