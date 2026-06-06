"use client";

import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Quên mật khẩu
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Nhập email của bạn để nhận mã khôi phục
      </p>

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Nhập địa chỉ email"
              className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <Link href="/verify-code">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition shadow-sm shadow-green-600/25"
          >
            Nhận mã khôi phục tài khoản
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </form>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 mt-6 text-sm font-medium text-green-600 hover:text-green-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại đăng nhập
      </Link>
    </div>
  );
}
