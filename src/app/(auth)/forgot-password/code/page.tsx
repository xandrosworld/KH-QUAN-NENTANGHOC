"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, KeyboardEvent, Suspense, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const codeLength = 5;

export default function ForgotPasswordCodePage() {
  return (
    <Suspense fallback={<div />}>
      <ForgotPasswordCodeForm />
    </Suspense>
  );
}

function ForgotPasswordCodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [code, setCode] = useState(Array.from({ length: codeLength }, () => ""));
  const [seconds, setSeconds] = useState(45);
  const [devOtp, setDevOtp] = useState(searchParams.get("devOtp") ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(value - 1, 0)), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextCode = [...code];
    nextCode[index] = digit;
    setCode(nextCode);
    setError("");

    if (digit && index < codeLength - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const resendOtp = async () => {
    if (!email || seconds > 0) return;
    setError("");
    setLoading(true);
    const response = await fetch("/api/auth/password-reset/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const payload = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Không gửi lại được mã OTP.");
      return;
    }

    setDevOtp(payload.devOtp ?? "");
    setSeconds(45);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const joinedCode = code.join("");

    if (joinedCode.length !== codeLength) {
      setError("Vui lòng nhập đủ mã xác nhận.");
      return;
    }

    const query = new URLSearchParams({ email, code: joinedCode });
    router.push(`/reset-password?${query.toString()}`);
  };

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Đã gửi mã đặt lại mật khẩu</h1>
      <p className="mb-8 max-w-[440px] text-gray-500">
        Kiểm tra hộp thư của bạn và nhập mã đặt lại mật khẩu để khôi phục tài khoản.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form className="space-y-7" onSubmit={handleSubmit}>
        {devOtp && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            Dev OTP: <span className="font-bold tracking-[0.35em]">{devOtp}</span>
          </div>
        )}

        <div className="flex gap-4 sm:gap-5">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputsRef.current[index] = element;
              }}
              value={digit}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              inputMode="numeric"
              maxLength={1}
              className="h-[72px] w-[72px] rounded-xl border border-gray-300 bg-white text-center text-2xl font-bold text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={resendOtp}
          disabled={seconds > 0 || loading}
          className="text-sm font-bold text-green-600 transition hover:text-green-700 disabled:cursor-not-allowed disabled:text-green-400"
        >
          Gửi lại mã {seconds > 0 ? `(${seconds.toString().padStart(2, "0")}s)` : ""}
        </button>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-4 font-semibold text-white shadow-lg shadow-green-600/25 transition hover:bg-green-700"
        >
          Gửi mã
          <ArrowRight className="h-5 w-5" />
        </button>
      </form>

      <Link href="/login" className="mt-7 inline-flex items-center gap-4 text-sm font-medium text-gray-500 transition hover:text-green-600">
        <ArrowLeft className="h-5 w-5 text-gray-400" />
        Quay lại đăng nhập
      </Link>
    </div>
  );
}
