"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        Nhập mật khẩu mới!
      </h1>
      <p className="mb-8 text-gray-500">
        Nhập mật khẩu mới để tiếp tục sử dụng tài khoản của bạn.
      </p>

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            Mật khẩu mới
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu mới"
              className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-12 text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-12 text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
            >
              {showConfirm ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="mb-2 text-sm font-semibold text-gray-700">
            Mật khẩu phải có:
          </p>
          <ul className="space-y-1 text-sm text-gray-500">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              Ít nhất 8 ký tự
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              Chứa chữ hoa và chữ thường
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              Chứa ít nhất 1 số
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              Chứa ít nhất 1 ký tự đặc biệt
            </li>
          </ul>
        </div>

        <Link
          href="/login"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700"
        >
          Xác nhận
          <ArrowRight className="h-5 w-5" />
        </Link>
      </form>
    </div>
  );
}
