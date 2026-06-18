"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    let active = true;
    requestAnimationFrame(() => {
      if (active) {
        setMounted(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);
  return mounted;
}

// Client-safe theme store manager using useSyncExternalStore
const themeListeners = new Set<() => void>();

const getThemeSnapshot = () => {
  if (typeof window === "undefined") return "light";
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return savedTheme === "dark" || (!savedTheme && systemPrefersDark) ? "dark" : "light";
};

const getThemeServerSnapshot = () => "light";

const subscribeTheme = (callback: () => void) => {
  themeListeners.add(callback);
  window.addEventListener("storage", callback);
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", callback);

  return () => {
    themeListeners.delete(callback);
    window.removeEventListener("storage", callback);
    mediaQuery.removeEventListener("change", callback);
  };
};

const updateTheme = (newTheme: "light" | "dark") => {
  if (typeof window === "undefined") return;
  localStorage.setItem("theme", newTheme);

  if (newTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  // Notify listeners to trigger re-renders
  themeListeners.forEach((listener) => listener());
};

export default function Footer() {
  const mounted = useIsMounted();
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

  const toggleTheme = () => {
    updateTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <footer className="mt-16 border-t border-border-color pt-8 flex justify-between items-end w-full pb-8">
      <div className="flex flex-col gap-2">
        <p className="text-[0.8rem] text-text-muted">
          © {new Date().getFullYear()} Gen-AI Lab. Built with Next.js, Shadcn & Tailwind v4.
        </p>
      </div>

      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg bg-bg-secondary hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors cursor-pointer flex items-center justify-center focus:outline-none"
        title={mounted ? `Switch to ${theme === "light" ? "dark" : "light"} mode` : "Loading theme"}
        aria-label="Toggle theme"
        disabled={!mounted}
      >
        {!mounted ? (
          <span className="w-3 h-3 block" />
        ) : theme === "light" ? (
          <Moon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )}
      </button>
    </footer>
  );
}
