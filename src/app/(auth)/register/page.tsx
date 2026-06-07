"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, User } from "lucide-react";

const codeLength = 5;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [code, setCode] = useState(Array.from({ length: codeLength }, () => ""));
  const [devOtp, setDevOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const requestOtp = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setError("");
    setMessage("");

    if (name.trim().length < 2) {
      setError("Tên hiển thị cần tối thiểu 2 ký tự.");
      return;
    }

    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu cần tối thiểu 8 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/register/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const payload = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Không gửi được mã OTP.");
      return;
    }

    setDevOtp(payload.devOtp ?? "");
    setStep("otp");
    setMessage("Mã OTP đã được gửi tới email đăng ký.");
  };

  const verifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const otp = code.join("");
    if (otp.length !== codeLength) {
      setError("Vui lòng nhập đủ mã OTP.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/register/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const payload = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Mã OTP không hợp lệ.");
      return;
    }

    setMessage("Đăng ký thành công. Vui lòng đăng nhập.");
    setTimeout(() => router.push("/login"), 800);
  };

  const handleCodeChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextCode = [...code];
    nextCode[index] = digit;
    setCode(nextCode);
    setError("");

    if (digit && index < codeLength - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        {step === "form" ? "Đăng ký tài khoản" : "Xác thực email"}
      </h1>
      <p className="mb-8 text-gray-500">
        {step === "form"
          ? "Tạo tài khoản quản trị để bắt đầu sử dụng TronX."
          : "Nhập mã OTP đã gửi tới email của bạn."}
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </div>
      )}

      {step === "form" ? (
        <form className="space-y-5" onSubmit={requestOtp}>
          <TextInput icon={User} value={name} onChange={setName} label="Tên hiển thị" placeholder="Nhập tên của bạn" />
          <TextInput icon={Mail} value={email} onChange={setEmail} label="Email" placeholder="Nhập email" />
          <PasswordInput
            value={password}
            onChange={setPassword}
            show={showPassword}
            onToggle={() => setShowPassword((value) => !value)}
            label="Mật khẩu"
            placeholder="Đặt mật khẩu"
          />
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((value) => !value)}
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
          />

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-4 font-semibold text-white shadow-lg shadow-green-600/25 transition hover:bg-green-700 disabled:bg-green-400"
          >
            {loading ? "Đang gửi mã..." : "Gửi mã OTP"}
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>
      ) : (
        <form className="space-y-7" onSubmit={verifyOtp}>
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
                onChange={(event) => handleCodeChange(index, event.target.value)}
                onKeyDown={(event) => handleCodeKeyDown(index, event)}
                inputMode="numeric"
                maxLength={1}
                className="h-[72px] w-[72px] rounded-xl border border-gray-300 bg-white text-center text-2xl font-bold text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500"
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => requestOtp()}
            disabled={loading}
            className="text-sm font-bold text-green-600 transition hover:text-green-700 disabled:cursor-not-allowed disabled:text-green-400"
          >
            Gửi lại mã
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-4 font-semibold text-white shadow-lg shadow-green-600/25 transition hover:bg-green-700 disabled:bg-green-400"
          >
            {loading ? "Đang xác thực..." : "Xác nhận đăng ký"}
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>
      )}

      <Link href="/login" className="mt-7 inline-flex items-center gap-4 text-sm font-medium text-gray-500 transition hover:text-green-600">
        <ArrowLeft className="h-5 w-5 text-gray-400" />
        Quay lại đăng nhập
      </Link>
    </div>
  );
}

function TextInput({
  icon: Icon,
  value,
  onChange,
  label,
  placeholder,
}: {
  icon: typeof User;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-900">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  show,
  onToggle,
  label,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
  label: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-900">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-11 pr-12 text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-700"
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
