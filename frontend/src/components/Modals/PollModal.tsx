"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, BarChart2 } from "lucide-react";

interface PollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePoll: (pollData: { question: string; options: string[]; allowMultiple: boolean }) => void;
}

export const PollModal: React.FC<PollModalProps> = ({ isOpen, onClose, onCreatePoll }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      setError("Please provide at least two non-empty options.");
      return;
    }
    onCreatePoll({
      question: question.trim(),
      options: cleanOptions,
      allowMultiple,
    });
    // Reset and close
    setQuestion("");
    setOptions(["", ""]);
    setAllowMultiple(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-md bg-[#242428] border border-[#2e2e36] rounded-3xl p-6 text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-signal-blue/20 flex items-center justify-center text-signal-blue">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base">Create a Poll</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#323238] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-950/40 border border-red-800/50 p-2.5 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question */}
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1.5">Question</label>
            <input
              type="text"
              placeholder="Ask a question..."
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                setError(null);
              }}
              className="w-full bg-[#1c1c20] border border-[#2e2e36] rounded-xl px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-signal-blue transition-colors"
              autoFocus
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 block mb-1">Options</label>
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => {
                    handleOptionChange(idx, e.target.value);
                    setError(null);
                  }}
                  className="flex-1 bg-[#1c1c20] border border-[#2e2e36] rounded-xl px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-signal-blue transition-colors"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-[#2d2d34] rounded-lg transition-colors"
                    title="Remove option"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {options.length < 10 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="inline-flex items-center gap-1.5 text-xs text-signal-blue hover:text-blue-400 font-semibold pt-1 px-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add option</span>
              </button>
            )}
          </div>

          {/* Multiple choices toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-[#2e2e36]">
            <div>
              <span className="text-xs font-medium text-gray-200">Allow multiple answers</span>
              <p className="text-[11px] text-gray-400">Voters can select more than one option</p>
            </div>
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
              className="w-4 h-4 accent-signal-blue rounded cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:bg-[#2e2e36] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-signal-blue hover:bg-blue-600 text-white shadow-md transition-colors"
            >
              Create Poll
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
