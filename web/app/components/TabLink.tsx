"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TabLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className="tab"
      style={
        isActive
          ? { borderColor: "rgba(255,255,255,0.65)", fontWeight: 700 }
          : undefined
      }
    >
      {label}
    </Link>
  );
}
