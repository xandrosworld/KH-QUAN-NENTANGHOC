"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";

const OTP_LENGTH = 5;
const COUNTDOWN_SECONDS = 45;

export default function VerifyCodePage() {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;
      const next = [...otp];
      next[index] = value.slice(-1);
      setOtp(next);
      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(COUNTDOWN_SECONDS);
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        Đã gửi mã đặt lại mật khẩu!
      </h1>
      <p className="mb-8 text-gray-500">
        Kiểm tra hộp thư của bạn và nhập mã đặt lại mật khẩu để khôi phục tài
        khoản
      </p>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="flex items-center justify-center gap-3">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="h-14 w-14 rounded-xl border border-gray-200 bg-white text-center text-xl font-semibold text-gray-900 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          ))}
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0}
            className="text-sm font-medium text-green-600 hover:text-green-700 disabled:text-gray-400 disabled:cursor-not-allowed transition"
          >
            Gửi lại mã {countdown > 0 && `(${formatTime(countdown)})`}
          </button>
        </div>

        <Link
          href="/reset-password"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700"
        >
          Gửi mã
          <ArrowRight className="h-5 w-5" />
        </Link>
      </form>

      <Link
        href="/login"
        className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-green-600 transition hover:text-green-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại đăng nhập
      </Link>
    </div>
  );
}
