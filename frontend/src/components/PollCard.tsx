"use client";

import React from "react";
import { Check, CheckSquare, Square, Circle, CheckCircle2 } from "lucide-react";

interface PollOption {
  text: string;
}

interface PollCardProps {
  pollData: {
    question: string;
    options: PollOption[];
    allowMultiple?: boolean;
  };
  reactions?: { id: string; user_id: string; emoji: string }[];
  currentUserId?: string;
  onVote: (optionIndex: number) => void;
  isMe: boolean;
}

export const PollCard: React.FC<PollCardProps> = ({
  pollData,
  reactions = [],
  currentUserId,
  onVote,
  isMe,
}) => {
  const { question, options, allowMultiple } = pollData;

  // Calculate vote counts per option
  const optionVotes = options.map((_, idx) => {
    return reactions.filter((r) => r.emoji === `vote:${idx}`).length;
  });

  const totalVotes = optionVotes.reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-w-[260px] max-w-[340px] py-1 select-none">
      {/* Poll Question */}
      <h4 className="font-bold text-sm text-white leading-snug mb-1">{question}</h4>
      <p className="text-[11px] text-gray-300/80 mb-3">
        {allowMultiple ? "Select one or more" : "Select one"}
      </p>

      {/* Options List */}
      <div className="space-y-2">
        {options.map((opt, idx) => {
          const votes = optionVotes[idx] || 0;
          const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          const hasVoted = reactions.some(
            (r) => r.user_id === currentUserId && r.emoji === `vote:${idx}`
          );

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onVote(idx)}
              className={`w-full relative overflow-hidden text-left p-2.5 rounded-xl border transition-all ${
                hasVoted
                  ? "border-signal-blue/80 bg-signal-blue/15"
                  : "border-[#383842] bg-[#1e1e24]/60 hover:bg-[#25252c]"
              }`}
            >
              {/* Progress bar background fill */}
              {totalVotes > 0 && (
                <div
                  style={{ width: `${percent}%` }}
                  className={`absolute inset-y-0 left-0 transition-all duration-300 ${
                    hasVoted ? "bg-signal-blue/25" : "bg-white/10"
                  }`}
                />
              )}

              <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {allowMultiple ? (
                    hasVoted ? (
                      <CheckSquare className="w-4 h-4 text-signal-blue flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )
                  ) : hasVoted ? (
                    <CheckCircle2 className="w-4 h-4 text-signal-blue flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="text-xs font-medium text-white truncate">{opt.text}</span>
                </div>

                <div className="text-right flex-shrink-0 text-[11px] font-mono text-gray-300">
                  <span>{percent}%</span>
                  <span className="text-[10px] text-gray-400 ml-1">({votes})</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer / Total votes */}
      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
        <span>{totalVotes} vote{totalVotes === 1 ? "" : "s"}</span>
        <span className="text-[10px] opacity-75">Signal Poll</span>
      </div>
    </div>
  );
};
