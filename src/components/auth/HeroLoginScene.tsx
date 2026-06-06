type HeroLoginSceneProps = {
  className?: string;
};

const layers = [
  { href: "/brand/hero-login-optimized/shopee.webp", x: 260, y: 1982, width: 840, height: 535 },
  { href: "/brand/hero-login-optimized/lazada.webp", x: 67, y: 2661, width: 889, height: 449 },
  { href: "/brand/hero-login-optimized/tiktok-shop.webp", x: 22, y: 3238, width: 797, height: 543 },
  { href: "/brand/hero-login-optimized/tiki.webp", x: 3383, y: 2006, width: 657, height: 509 },
  { href: "/brand/hero-login-optimized/zalo.webp", x: 3539, y: 2666, width: 603, height: 505 },
  { href: "/brand/hero-login-optimized/pos.webp", x: 3444, y: 3272, width: 712, height: 537 },
  { href: "/brand/hero-login-optimized/tronx-symbol.webp", x: 1561, y: 1983, width: 1254, height: 1329 },
  { href: "/brand/hero-login-optimized/revenue-card.webp", x: 260, y: 4219, width: 1243, height: 1186 },
  { href: "/brand/hero-login-optimized/orders-card.webp", x: 1560, y: 4024, width: 1181, height: 1127 },
  { href: "/brand/hero-login-optimized/customers-card.webp", x: 2690, y: 4059, width: 1163, height: 1133 },
];

export default function HeroLoginScene({ className }: HeroLoginSceneProps) {
  return (
    <div className={className} aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 4367 5677"
        preserveAspectRatio="xMidYMid slice"
      >
        <image
          href="/brand/hero-login-optimized/background.webp"
          x="0"
          y="0"
          width="4367"
          height="5677"
          preserveAspectRatio="none"
        />
      </svg>

      <svg
        className="absolute inset-x-0 bottom-0 h-[68%] w-full xl:h-[70%]"
        viewBox="0 1350 4367 4327"
        preserveAspectRatio="xMidYMid meet"
      >
        {layers.map((layer) => (
          <image
            key={layer.href}
            href={layer.href}
            x={layer.x}
            y={layer.y}
            width={layer.width}
            height={layer.height}
            preserveAspectRatio="none"
          />
        ))}
      </svg>
    </div>
  );
}
