"use client";

import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        Quên mật khẩu
      </h1>
      <p className="mb-8 text-gray-500">
        Nhập email của bạn để nhận mã khôi phục
      </p>

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Nhập địa chỉ email"
              className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <Link
          href="/verify-code"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700"
        >
          Nhận mã khôi phục tài khoản
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
