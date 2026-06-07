"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const otp = searchParams.get("code") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email || !otp) {
      setError("Thiếu email hoặc mã OTP. Vui lòng gửi lại mã khôi phục.");
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu mới cần tối thiểu 8 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/password-reset/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword: password, confirmPassword }),
    });
    const payload = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Không đặt lại được mật khẩu.");
      return;
    }

    setMessage("Đã cập nhật mật khẩu. Vui lòng đăng nhập lại.");
    setTimeout(() => router.push("/login"), 900);
  };

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Nhập mật khẩu mới</h1>
      <p className="mb-10 max-w-[430px] text-gray-500">Nhập mật khẩu mới để tiếp tục sử dụng tài khoản của bạn.</p>

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

      <form className="space-y-6" onSubmit={handleSubmit}>
        <PasswordInput
          value={password}
          onChange={setPassword}
          show={showPassword}
          onToggle={() => setShowPassword((value) => !value)}
          placeholder="Đặt mật khẩu mới"
        />

        <PasswordInput
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirmPassword}
          onToggle={() => setShowConfirmPassword((value) => !value)}
          placeholder="Xác nhận mật khẩu mới"
        />

        <p className="text-sm leading-relaxed text-gray-400">
          Mật khẩu nên có ít nhất 8 ký tự, bao gồm chữ viết hoa, chữ viết thường và ký tự đặc biệt như !@#$%^&*
        </p>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-4 font-semibold text-white shadow-lg shadow-green-600/25 transition hover:bg-green-700 disabled:bg-green-400"
        >
          {loading ? "Đang xác nhận..." : "Xác nhận"}
          <ArrowRight className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  show,
  onToggle,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
}) {
  return (
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
  );
}
