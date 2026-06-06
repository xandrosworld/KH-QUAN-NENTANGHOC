import Image from "next/image";
import HeroLoginScene from "@/components/auth/HeroLoginScene";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-white">
      <section className="flex w-full items-center justify-center bg-white px-8 py-10 lg:w-[44.5%]">
        <div className="w-full max-w-[486px]">
          <Image
            src="/brand/logo.svg"
            alt="TronX"
            width={360}
            height={100}
            priority
            className="mx-auto mb-14 h-auto w-[280px] sm:w-[340px] lg:w-[360px]"
          />
          {children}
        </div>
      </section>

      <section className="relative hidden min-h-screen overflow-hidden bg-[#edf8ef] lg:block lg:w-[55.5%]">
        <HeroLoginScene className="pointer-events-none absolute inset-0 select-none" />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-white/70 via-white/30 to-transparent" />

        <div className="relative z-10 px-12 pt-12 xl:px-16 2xl:px-20 2xl:pt-16">
          <span className="inline-flex rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-green-700/20 xl:text-base">
            Giải pháp toàn diện
          </span>

          <h2 className="mt-7 max-w-[760px] text-[length:clamp(3rem,3.35vw,4.25rem)] font-extrabold leading-[1.08] tracking-[-0.045em] text-gray-950">
            Quản lý bán hàng
            <br />
            <span className="text-green-600">đa kênh</span> thông minh
          </h2>

          <p className="mt-6 max-w-[560px] text-[length:clamp(1.05rem,1.04vw,1.22rem)] leading-relaxed text-gray-700">
            Tron X giúp bạn đồng bộ mọi kênh bán hàng,
            <br />
            tối ưu vận hành và tăng trưởng doanh thu vượt trội.
          </p>
        </div>
      </section>
    </div>
  );
}
