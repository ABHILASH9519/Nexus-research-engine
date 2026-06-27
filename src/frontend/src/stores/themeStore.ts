import { create } from "zustand";

interface ThemeState {
  theme: "light" | "dark" | "system";
  resolvedTheme: "light" | "dark";
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "system",
  resolvedTheme: "light",
  setTheme: (theme) => {
    set({ theme });
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      set({ resolvedTheme: "dark" });
    } else if (theme === "light") {
      root.classList.remove("dark");
      set({ resolvedTheme: "light" });
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (prefersDark) {
        root.classList.add("dark");
        set({ resolvedTheme: "dark" });
      } else {
        root.classList.remove("dark");
        set({ resolvedTheme: "light" });
      }
    }
  },
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.resolvedTheme === "light" ? "dark" : "light";
      const root = document.documentElement;
      if (newTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      return { theme: newTheme, resolvedTheme: newTheme };
    }),
}));
