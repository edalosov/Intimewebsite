"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ConnectButton } from "@/components/ConnectButton";

// Only shown on the main gallery page — hidden on the artwork detail view
// (whether the intercepted modal or the full-page route), where they used
// to collide with the modal's own close button.
export function GlobalNav() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <>
      <header className="fixed top-0 left-0 z-50 p-6 sm:p-8">
        <ThemeToggle />
      </header>
      <header className="fixed top-0 right-0 z-50 p-6 sm:p-8">
        <ConnectButton />
      </header>
    </>
  );
}
