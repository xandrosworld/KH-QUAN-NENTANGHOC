"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6">
      <div />

      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/import"
          className="rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          aria-label="Import dữ liệu"
        >
          <Image
            src="/brand/button-import-data.svg"
            alt=""
            width={148}
            height={32}
            priority
          />
        </Link>

        {/* Notification bell */}
        <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {/* User profile */}
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
            A
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">Nguyễn Văn A</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
}
