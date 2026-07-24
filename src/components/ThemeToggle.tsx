"use client";

import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="gallery-connect-btn gallery-connect-btn--overlay" aria-label="Toggle color theme">
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
