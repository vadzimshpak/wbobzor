"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "theme";

function readStored(): "light" | "dark" | null {
  try {
    const t = localStorage.getItem(STORAGE_KEY);
    if (t === "light" || t === "dark") {
      return t;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function systemIsDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function effectiveMode(): "light" | "dark" {
  const stored = readStored();
  if (stored) {
    return stored;
  }
  return systemIsDark() ? "dark" : "light";
}

function SunIcon() {
  return (
    <svg
      className="site-header__theme-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="site-header__theme-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function ThemeToggle() {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMode(effectiveMode());
    setReady(true);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemThemeChange = () => {
      if (readStored() === null) {
        setMode(mq.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", onSystemThemeChange);
    return () => mq.removeEventListener("change", onSystemThemeChange);
  }, []);

  const toggle = () => {
    const next = mode === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    setMode(next);
  };

  const isDark = mode === "dark";

  return (
    <button
      type="button"
      className="site-header__theme-toggle"
      onClick={toggle}
      disabled={!ready}
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      aria-pressed={isDark ? true : undefined}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
