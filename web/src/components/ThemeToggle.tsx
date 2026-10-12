import React, { useState } from "react";

const STORAGE_KEY = "epl-theme";

/** Light is the default; the toggle opts into dark and remembers the choice. */
export const ThemeToggle: React.FC = () => {
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === "dark");
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
