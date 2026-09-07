"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface VoiceMessagePlayerProps {
  audioUrl: string;
  isMe: boolean;
}

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({ audioUrl, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fullUrl = audioUrl.startsWith("http")
    ? audioUrl
    : `http://localhost:8000${audioUrl}`;

  useEffect(() => {
    const audio = new Audio(fullUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (!isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audioRef.current = null;
    };
  }, [fullUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn("Audio play blocked or failed:", e);
      });
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = pos * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec)) return "0:00";
    const mins = Math.floor(sec / 60);
    const remainder = Math.floor(sec % 60);
    return `${mins}:${remainder.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Generate 24 static waveform heights for the authentic Signal voice message shape
  const waveBars = [
    25, 45, 75, 40, 60, 90, 100, 70, 50, 85, 95, 60,
    75, 40, 55, 90, 80, 45, 65, 85, 50, 70, 40, 30
  ];

  return (
    <div className="flex items-center gap-3 py-1.5 px-1 min-w-[240px] max-w-[300px] select-none">
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 ${
          isMe
            ? "bg-white text-signal-blue hover:bg-white/90"
            : "bg-signal-blue text-white hover:bg-blue-600"
        } shadow-md`}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current stroke-none" />
        ) : (
          <Play className="w-4 h-4 fill-current stroke-none ml-0.5" />
        )}
      </button>

      {/* Waveform & Scrubber */}
      <div className="flex-1 flex flex-col justify-center gap-1 cursor-pointer" onClick={handleSeek}>
        <div className="flex items-center gap-[2.5px] h-7">
          {waveBars.map((height, i) => {
            const barProgress = (i / waveBars.length) * 100;
            const isPlayed = barProgress <= progressPercent;
            return (
              <div
                key={i}
                style={{ height: `${height}%` }}
                className={`w-1 rounded-full transition-colors duration-100 ${
                  isPlayed
                    ? isMe
                      ? "bg-white"
                      : "bg-signal-blue"
                    : isMe
                    ? "bg-white/35"
                    : "bg-gray-500/40"
                }`}
              />
            );
          })}
        </div>

        {/* Time display */}
        <div className="flex items-center justify-between text-[11px] opacity-80 font-mono">
          <span>{formatSeconds(currentTime > 0 ? currentTime : duration)}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              cycleSpeed();
            }}
            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
              isMe
                ? "bg-black/20 text-white hover:bg-black/30"
                : "bg-white/10 text-gray-200 hover:bg-white/20"
            }`}
          >
            {playbackRate}x
          </button>
        </div>
      </div>
    </div>
  );
};
