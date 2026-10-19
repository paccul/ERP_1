"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="h-8 w-8 rounded-lg border border-[#374151] bg-[#111827] opacity-60"
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Ganti ke Tema Terang" : "Ganti ke Tema Gelap"}
      title={isDark ? "Ganti ke Tema Terang (Light Mode)" : "Ganti ke Tema Gelap (Dark Mode)"}
      className="relative flex h-8 w-8 items-center justify-center rounded-lg border-[#374151] bg-[#111827] p-0 text-[#9ca3af] hover:bg-[#1f2937] hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
    >
      <Sun
        className={`h-4 w-4 text-amber-500 transition-all duration-300 ${
          isDark
            ? "scale-0 rotate-90 opacity-0 absolute"
            : "scale-100 rotate-0 opacity-100"
        }`}
      />
      <Moon
        className={`h-4 w-4 text-amber-400 transition-all duration-300 ${
          isDark
            ? "scale-100 rotate-0 opacity-100"
            : "scale-0 -rotate-90 opacity-0 absolute"
        }`}
      />
      <span className="sr-only">
        {isDark ? "Ganti ke Tema Terang" : "Ganti ke Tema Gelap"}
      </span>
    </Button>
  );
}
