import React, { useEffect, useState } from "react";

const STORAGE_KEY = "epl-theme";

const systemDark = () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
const effectiveDark = () => {
  const chosen = document.documentElement.dataset.theme;
  return chosen ? chosen === "dark" : systemDark();
};

/** Footer switch between light and dark; remembers the choice, otherwise follows the OS. */
export const ThemeToggle: React.FC = () => {
  const [dark, setDark] = useState(effectiveDark);
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onChange = () => setDark(effectiveDark());
    media?.addEventListener("change", onChange);
    return () => media?.removeEventListener("change", onChange);
  }, []);
  const toggle = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be blocked; the choice still applies for this visit.
    }
    setDark(!dark);
  };
  return (
    <button type="button" className="text-button" onClick={toggle} aria-pressed={dark}>
      Dark mode
    </button>
  );
};
