"use client";

import Image from "next/image";
import Link from "next/link";

export function Logo({ withWordmark = true }: { withWordmark?: boolean }) {
  const src = withWordmark
    ? "/images/logo/scanminers-logo-horizontal.svg"
    : "/images/logo/scanminers-icon.svg";

  const width = withWordmark ? 200 : 40;
  const height = 40;

  return (
    <Link href="/" aria-label="Scanminers home" className="flex items-center">
      <Image
        src={src}
        alt="Scanminers logo"
        width={width}
        height={height}
        priority
        className="h-10 w-auto"
      />
    </Link>
  );
}
