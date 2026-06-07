"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, User } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/password-reset/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const payload = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Không gửi được mã khôi phục.");
      return;
    }

    const query = new URLSearchParams({ email: email.trim() });
    if (payload.devOtp) query.set("devOtp", payload.devOtp);
    router.push(`/forgot-password/code?${query.toString()}`);
  };

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Quên mật khẩu</h1>
      <p className="mb-10 text-gray-500">Nhập email của bạn để nhận mã khôi phục.</p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">Email</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Nhập email"
              className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-4 font-semibold text-white shadow-lg shadow-green-600/25 transition hover:bg-green-700 disabled:bg-green-400"
        >
          {loading ? "Đang gửi mã..." : "Nhận mã khôi phục tài khoản"}
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
