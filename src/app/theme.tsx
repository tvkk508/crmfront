import type { ReactNode } from "react";
import { useEffect } from "react";
import { useUiSettingsStore } from "../stores/uiSettings";

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const density = useUiSettingsStore((state) => state.density);

  useEffect(() => {
    document.documentElement.setAttribute("data-density", density);
    document.body.setAttribute("data-density", density);
  }, [density]);

  return children;
}
