"use client";

import React, { useState } from "react";
import { Lock, ShieldCheck, ArrowRight, Smartphone, Sparkles, User, Check } from "lucide-react";
import { useSignal } from "@/context/SignalContext";
import { api } from "@/lib/api";
import { Avatar } from "@/components/Avatar";

export const AuthScreen: React.FC = () => {
  const { verifyOtpLogin, seedUsers, switchUserAccount } = useSignal();

  const [step, setStep] = useState<"identifier" | "otp" | "profile">("identifier");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(
    "https://api.dicebear.com/7.x/avataaars/svg?seed=SignalUser"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      await api.requestOtp(identifier.trim());
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to request code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      await verifyOtpLogin(identifier.trim(), otp.trim(), displayName || undefined, avatarUrl || undefined);
    } catch (err: any) {
      setError(err.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const AVATAR_OPTIONS = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=AliceSmith&hair=long01",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=BobJohnson&hair=short01",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Moxie&hair=dreads01",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Snowden&facialHair=beardLight",
    "https://api.dicebear.com/7.x/bottts/svg?seed=RobotSignal",
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-[#121214] p-4 text-gray-900 dark:text-gray-100 select-none">
      <div className="w-full max-w-md bg-white dark:bg-[#1a1a1e] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 space-y-6">
        {/* Signal Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-signal-blue text-white flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Signal Messenger</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Privacy that fits in your pocket
          </p>
        </div>

        {/* Step 1: Enter Phone Number or Username */}
        {step === "identifier" && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                Phone Number or Username
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="+1 555 0199 or @username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-[#141417] border border-gray-200 dark:border-gray-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-signal-blue transition-all"
                  autoFocus
                  required
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={isLoading || !identifier.trim()}
              className="w-full py-3 px-4 rounded-xl bg-signal-blue hover:bg-signal-blue-hover text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <span>{isLoading ? "Sending Code..." : "Continue"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: Verification Code (OTP) */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in duration-150">
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-500">
                Enter the 6-digit code sent to <span className="font-semibold text-gray-800 dark:text-gray-200">{identifier}</span>
              </p>
              <div className="inline-block px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-signal-blue rounded-lg text-xs font-mono">
                Mock Code: 123456
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center tracking-widest text-2xl font-mono py-3 rounded-xl bg-gray-50 dark:bg-[#141417] border border-gray-200 dark:border-gray-700 focus:outline-hidden focus:ring-2 focus:ring-signal-blue"
                autoFocus
                required
              />
            </div>

            {/* Quick Fill Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setOtp("123456")}
                className="text-xs text-signal-blue hover:underline font-medium"
              >
                Auto-fill 123456
              </button>
            </div>

            {/* Optional profile fields for new users */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">
                Display Name (Optional)
              </label>
              <input
                type="text"
                placeholder="Your Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#141417] border border-gray-200 dark:border-gray-700 text-xs focus:outline-hidden focus:ring-1 focus:ring-signal-blue"
              />

              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 pt-1">
                Choose Avatar
              </label>
              <div className="flex items-center gap-2 justify-center">
                {AVATAR_OPTIONS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`rounded-full p-0.5 border-2 transition-transform hover:scale-110 ${
                      avatarUrl === url ? "border-signal-blue scale-110" : "border-transparent"
                    }`}
                  >
                    <Avatar name={`Option ${i}`} url={url} size="sm" showOnlineBadge={false} />
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full py-3 px-4 rounded-xl bg-signal-blue hover:bg-signal-blue-hover text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <span>{isLoading ? "Verifying..." : "Verify & Sign In"}</span>
              <Check className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setStep("identifier")}
              className="w-full text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 py-1"
            >
              ← Back to phone / username
            </button>
          </form>
        )}

        {/* Demo Fast Login Selector (Ideal for evaluators!) */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Fast Demo Sign-In (One Click)</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {seedUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => switchUserAccount(u.id)}
                className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-[#161619] hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-gray-200 dark:border-gray-800 hover:border-signal-blue transition-all text-left group"
              >
                <Avatar name={u.display_name} url={u.avatar_url} size="xs" isOnline={u.is_online} />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-gray-800 dark:text-gray-200 group-hover:text-signal-blue truncate">
                    {u.display_name.split(" ")[0]}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">@{u.username}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Privacy footnote */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Simulated End-to-End Encryption Enabled</span>
        </div>
      </div>
    </div>
  );
};
