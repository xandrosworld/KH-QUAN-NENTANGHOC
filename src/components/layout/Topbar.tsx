"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import {
  Bell,
  Camera,
  CheckCircle2,
  ChevronDown,
  KeyRound,
  Loader2,
  LogOut,
  Save,
  User,
  X,
} from "lucide-react";

type AdminProfile = {
  name: string;
  email: string;
  role: string;
  avatarDataUrl?: string;
};

type ModalView = "profile" | "password" | null;

const defaultProfile: AdminProfile = {
  name: "Nguyễn Văn A",
  email: "admin@tronx.vn",
  role: "Admin",
};

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(-1)[0]
      ?.charAt(0)
      .toUpperCase() || "A"
  );
}

function Avatar({ profile, size = "md" }: { profile: AdminProfile; size?: "md" | "lg" }) {
  const className =
    size === "lg"
      ? "h-20 w-20 text-2xl"
      : "h-9 w-9 text-sm";

  if (profile.avatarDataUrl) {
    return (
      <Image
        src={profile.avatarDataUrl}
        alt={profile.name}
        width={size === "lg" ? 80 : 36}
        height={size === "lg" ? 80 : 36}
        unoptimized
        className={`${className} rounded-full object-cover ring-2 ring-green-100`}
      />
    );
  }

  return (
    <div className={`${className} flex items-center justify-center rounded-full bg-green-600 font-bold text-white`}>
      {initials(profile.name)}
    </div>
  );
}

export default function Topbar() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<AdminProfile>(defaultProfile);
  const [profileForm, setProfileForm] = useState<AdminProfile>(defaultProfile);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalView, setModalView] = useState<ModalView>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetch("/api/account")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!mounted || !data?.profile) return;
        setProfile(data.profile);
        setProfileForm(data.profile);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const openModal = (view: ModalView) => {
    setModalView(view);
    setMenuOpen(false);
    setMessage("");
    setError("");
    setProfileForm(profile);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const closeModal = () => {
    setModalView(null);
    setMessage("");
    setError("");
    setSaving(false);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh.");
      return;
    }

    if (file.size > 650 * 1024) {
      setError("Ảnh đại diện nên nhỏ hơn 650KB để web tải nhanh.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setError("");
      setProfileForm((current) => ({
        ...current,
        avatarDataUrl: String(reader.result),
      }));
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileForm),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setError(data.error ?? "Không lưu được hồ sơ.");
      return;
    }

    setProfile(data.profile);
    setProfileForm(data.profile);
    setMessage("Đã lưu hồ sơ admin.");
    window.dispatchEvent(new CustomEvent("tronx-profile-updated", { detail: data.profile }));
  };

  const savePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwordForm),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setError(data.error ?? "Không đổi được mật khẩu.");
      return;
    }

    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setMessage("Đã đổi mật khẩu. Lần đăng nhập sau dùng mật khẩu mới.");
  };

  return (
    <>
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

          <button className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100">
            <Bell size={20} />
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              3
            </span>
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-gray-50"
              aria-expanded={menuOpen}
            >
              <Avatar profile={profile} />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{profile.name}</p>
                <p className="text-xs text-gray-500">{profile.role}</p>
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 z-40 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/70">
                <div className="border-b border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar profile={profile} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-950">{profile.name}</p>
                      <p className="truncate text-xs text-gray-500">{profile.email}</p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => openModal("profile")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-green-50 hover:text-green-700"
                  >
                    <User size={17} />
                    Hồ sơ tài khoản
                  </button>
                  <button
                    onClick={() => openModal("password")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-green-50 hover:text-green-700"
                  >
                    <KeyRound size={17} />
                    Đổi mật khẩu
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={17} />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {modalView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-950">
                  {modalView === "profile" ? "Hồ sơ tài khoản" : "Đổi mật khẩu"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {modalView === "profile"
                    ? "Thông tin hiển thị cho tài khoản quản trị."
                    : "Cập nhật mật khẩu đăng nhập dashboard."}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {modalView === "profile" ? (
              <form onSubmit={saveProfile} className="space-y-5 p-6">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <Avatar profile={profileForm} size="lg" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-colors hover:bg-green-700"
                      aria-label="Thay ảnh đại diện"
                    >
                      <Camera size={16} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Ảnh đại diện</p>
                    <p className="mt-1 text-xs text-gray-500">PNG/JPG/WebP, nên nhỏ hơn 650KB.</p>
                    {profileForm.avatarDataUrl && (
                      <button
                        type="button"
                        onClick={() => setProfileForm((current) => ({ ...current, avatarDataUrl: undefined }))}
                        className="mt-2 text-xs font-semibold text-red-500 hover:text-red-600"
                      >
                        Xóa ảnh hiện tại
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-gray-800">Tên hiển thị</span>
                    <input
                      value={profileForm.name}
                      onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                      className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-50"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-gray-800">Email đăng nhập</span>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                      className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-50"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-gray-800">Vai trò</span>
                    <input
                      value={profileForm.role}
                      disabled
                      className="h-11 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 text-sm text-gray-500"
                    />
                  </label>
                </div>

                <StatusMessage error={error} message={message} />

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Lưu hồ sơ
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={savePassword} className="space-y-5 p-6">
                <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
                  Mật khẩu mới sẽ được lưu cho tài khoản admin hiện tại và dùng cho lần đăng nhập tiếp theo.
                </div>

                <div className="grid gap-4">
                  <PasswordInput
                    label="Mật khẩu hiện tại"
                    value={passwordForm.currentPassword}
                    onChange={(value) => setPasswordForm((current) => ({ ...current, currentPassword: value }))}
                  />
                  <PasswordInput
                    label="Mật khẩu mới"
                    value={passwordForm.newPassword}
                    onChange={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))}
                  />
                  <PasswordInput
                    label="Nhập lại mật khẩu mới"
                    value={passwordForm.confirmPassword}
                    onChange={(value) => setPasswordForm((current) => ({ ...current, confirmPassword: value }))}
                  />
                </div>

                <StatusMessage error={error} message={message} />

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                    Đổi mật khẩu
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function StatusMessage({ error, message }: { error: string; message: string }) {
  if (!error && !message) return null;

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
        error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
      }`}
    >
      {message && <CheckCircle2 size={16} />}
      <span>{error || message}</span>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-gray-800">{label}</span>
      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-50"
      />
    </label>
  );
}
