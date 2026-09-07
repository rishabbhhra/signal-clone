"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone, Volume2, Shield } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { startRingtone } from "@/lib/sound";

interface CallModalProps {
  contactName: string;
  avatarUrl?: string | null;
  isVideo: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  contactName,
  avatarUrl,
  isVideo,
  isOpen,
  onClose,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(isVideo);
  const [callState, setCallState] = useState<"ringing" | "connected">("ringing");
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Ringtone and call duration
  useEffect(() => {
    if (!isOpen) return;

    setCallState("ringing");
    setSecondsElapsed(0);

    const stopRingtone = startRingtone();

    // Auto connect after 3.5 seconds
    const timer = setTimeout(() => {
      stopRingtone();
      setCallState("connected");
    }, 3500);

    return () => {
      stopRingtone();
      clearTimeout(timer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (callState !== "connected" || !isOpen) return;

    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callState, isOpen]);

  if (!isOpen) return null;

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-[#18181c] rounded-3xl shadow-2xl border border-gray-800 overflow-hidden flex flex-col items-center p-8 text-white relative">
        {/* Security badge */}
        <div className="absolute top-5 left-5 flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">
          <Shield className="w-3.5 h-3.5 text-signal-blue" />
          <span>Encrypted Call</span>
        </div>

        {/* Avatar with pulse ring */}
        <div className="mt-8 relative flex items-center justify-center">
          {callState === "ringing" && (
            <div className="absolute w-36 h-36 rounded-full bg-signal-blue/20 animate-ping" />
          )}
          <Avatar
            name={contactName}
            url={avatarUrl}
            size="xl"
            showOnlineBadge={false}
            className="ring-4 ring-signal-blue/40 shadow-xl"
          />
        </div>

        {/* Contact Info */}
        <h2 className="mt-6 text-2xl font-bold tracking-tight">{contactName}</h2>
        <p className="mt-1 text-sm text-gray-400 font-medium">
          {callState === "ringing" ? (
            <span className="animate-pulse">Signal {isVideo ? "Video" : "Audio"} Call — Ringing...</span>
          ) : (
            <span className="text-emerald-400 font-mono">{formatTime(secondsElapsed)}</span>
          )}
        </p>

        {callState === "connected" && (
          <div className="mt-3 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
            Connected (High Definition Voice)
          </div>
        )}

        {/* Simulated Video Preview */}
        {isVideo && isVideoEnabled && callState === "connected" && (
          <div className="w-full h-44 mt-6 rounded-2xl bg-[#26262e] flex flex-col items-center justify-center border border-gray-700 relative overflow-hidden">
            <Video className="w-10 h-10 text-gray-500 mb-2" />
            <span className="text-xs text-gray-400">Simulated Encrypted Video Stream</span>
            {/* Small selfie pip */}
            <div className="absolute bottom-2 right-2 w-16 h-12 rounded-lg bg-black/60 border border-white/20 flex items-center justify-center text-[10px] text-gray-400">
              You
            </div>
          </div>
        )}

        {/* Call Controls */}
        <div className="mt-10 flex items-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-full transition-all ${
              isMuted
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {isVideo && (
            <button
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className={`p-3.5 rounded-full transition-all ${
                !isVideoEnabled
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
              title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {!isVideoEnabled ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
          )}

          <button
            onClick={onClose}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-transform active:scale-95"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
