"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upload } from "lucide-react";

type SidebarItem = {
  id: string;
  label: string;
  href: string;
  asset?: string;
  width?: number;
  height?: number;
};

const dashboardItem: SidebarItem = {
  id: "dashboard",
  label: "Dashboard",
  href: "/dashboard",
  asset: "/brand/sidebar/dashboard.svg",
  width: 106,
  height: 19,
};

const groups: { label: string; asset?: string; items: SidebarItem[] }[] = [
  {
    label: "IMPORT & DATA",
    asset: "/brand/sidebar/group-import-data.svg",
    items: [
      {
        id: "import",
        label: "Import dữ liệu",
        href: "/dashboard/import",
      },
      {
        id: "data",
        label: "Quản lý dữ liệu",
        href: "/dashboard/data-management",
        asset: "/brand/sidebar/data-management.svg",
        width: 180,
        height: 20,
      },
    ],
  },
  {
    label: "BÁO CÁO",
    items: [
      {
        id: "revenue",
        label: "Báo cáo doanh thu",
        href: "/dashboard/reports/revenue",
        asset: "/brand/sidebar/report-revenue.svg",
        width: 164,
        height: 23,
      },
      {
        id: "profit",
        label: "Báo cáo lợi nhuận",
        href: "/dashboard/reports/profit",
        asset: "/brand/sidebar/report-profit.svg",
        width: 154,
        height: 16,
      },
      {
        id: "products",
        label: "Báo cáo sản phẩm",
        href: "/dashboard/reports/products",
        asset: "/brand/sidebar/report-products.svg",
        width: 159,
        height: 19,
      },
      {
        id: "campaigns",
        label: "Báo cáo campaign",
        href: "/dashboard/reports/campaigns",
        asset: "/brand/sidebar/report-campaigns.svg",
        width: 159,
        height: 19,
      },
      {
        id: "platforms",
        label: "Báo cáo theo nền tảng",
        href: "/dashboard/reports/platforms",
        asset: "/brand/sidebar/report-platforms.svg",
        width: 190,
        height: 21,
      },
    ],
  },
  {
    label: "CÀI ĐẶT",
    items: [
      {
        id: "kpi",
        label: "Cài đặt công thức / KPI",
        href: "/dashboard/settings/kpi",
        asset: "/brand/sidebar/settings-kpi.svg",
        width: 192,
        height: 15,
      },
      {
        id: "shops",
        label: "Quản lý shop / nền tảng",
        href: "/dashboard/settings/shops",
        asset: "/brand/sidebar/settings-shops.svg",
        width: 198,
        height: 20,
      },
      {
        id: "system",
        label: "Cài đặt hệ thống",
        href: "/dashboard/settings/system",
        asset: "/brand/sidebar/settings-system.svg",
        width: 147,
        height: 21,
      },
    ],
  },
];

function isItemActive(pathname: string, item: SidebarItem) {
  return (
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))
  );
}

function NavigationItem({
  item,
  pathname,
}: {
  item: SidebarItem;
  pathname: string;
}) {
  const active = isItemActive(pathname, item);

  if (item.id === "data" && active) {
    return (
      <Link
        href={item.href}
        aria-label={item.label}
        className="block h-10 w-[222px] overflow-hidden rounded-[7px] shadow-[0_2px_5px_rgba(0,155,83,0.16)]"
      >
        <Image
          src="/brand/sidebar/data-management-active.svg"
          alt=""
          width={222}
          height={40}
          className="h-10 w-[222px]"
        />
      </Link>
    );
  }

  if (item.id === "import") {
    return (
      <Link
        href={item.href}
        className={`flex h-10 w-[222px] items-center gap-2.5 rounded-[7px] px-3 text-[14px] font-medium transition-colors ${
          active
            ? "bg-[#009B53] text-white shadow-[0_2px_5px_rgba(0,155,83,0.16)]"
            : "text-[#009B53] hover:bg-[#ECFAF1]"
        }`}
      >
        <Upload size={18} strokeWidth={1.65} aria-hidden="true" />
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      aria-label={item.label}
      className={`flex h-10 w-[222px] items-center rounded-[7px] px-3 transition-colors ${
        active
          ? "bg-[#009B53] shadow-[0_2px_5px_rgba(0,155,83,0.16)]"
          : "hover:bg-[#ECFAF1]"
      }`}
    >
      {item.asset && item.width && item.height && (
        <Image
          src={item.asset}
          alt=""
          width={item.width}
          height={item.height}
          className={`h-auto max-w-full object-contain ${
            active ? "brightness-0 invert" : ""
          }`}
          style={
            item.id === "data"
              ? {
                  filter:
                    "brightness(0) saturate(100%) invert(37%) sepia(88%) saturate(1023%) hue-rotate(116deg) brightness(89%) contrast(102%)",
                }
              : undefined
          }
        />
      )}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[260px] flex-none flex-col border-r border-[#D4D4D4] bg-white">
      <div className="flex h-[72px] items-center border-b border-[#E9E9E9] px-[19px]">
        <Image
          src="/brand/logo.svg"
          alt="TronX"
          width={128}
          height={35}
          priority
        />
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-[19px] pt-[18px]">
        <NavigationItem item={dashboardItem} pathname={pathname} />

        {groups.map((group) => (
          <section key={group.label} className="mt-[18px]">
            <div className="mb-[7px] flex h-[15px] items-center">
              {group.asset ? (
                <Image
                  src={group.asset}
                  alt={group.label}
                  width={116}
                  height={12}
                  className="h-3 w-auto"
                />
              ) : (
                <h2 className="text-[12px] font-bold uppercase leading-none text-[#009B53]">
                  {group.label}
                </h2>
              )}
            </div>

            <div className="space-y-0">
              {group.items.map((item) => (
                <NavigationItem
                  key={item.id}
                  item={item}
                  pathname={pathname}
                />
              ))}
            </div>
          </section>
        ))}
      </nav>

      <div className="px-[17px] pb-[18px] pt-3">
        <Link
          href="#"
          aria-label="Xem hướng dẫn sử dụng"
          className="block h-[62px] w-[225px] rounded-[8px] transition-opacity hover:opacity-90"
        >
          <Image
            src="/brand/sidebar/help-card.svg"
            alt=""
            width={225}
            height={62}
            className="h-[62px] w-[225px]"
          />
        </Link>
      </div>
    </aside>
  );
}
