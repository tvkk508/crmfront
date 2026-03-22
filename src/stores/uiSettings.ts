import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DensityMode = "compact" | "comfortable";

type UiSettingsState = {
  density: DensityMode;
  leftPanelWidth: number;
  rightPanelWidth: number;
  rightPanelOpen: boolean;
  collapsedSections: Record<string, boolean>;
  setDensity: (density: DensityMode) => void;
  setLeftPanelWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
  setRightPanelOpen: (open: boolean) => void;
  toggleSection: (id: string) => void;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const useUiSettingsStore = create<UiSettingsState>()(
  persist(
    (set) => ({
      density: "compact",
      leftPanelWidth: 320,
      rightPanelWidth: 520,
      rightPanelOpen: true,
      collapsedSections: {},
      setDensity: (density) => set({ density }),
      setLeftPanelWidth: (width) =>
        set({ leftPanelWidth: clamp(width, 260, 420) }),
      setRightPanelWidth: (width) =>
        set({ rightPanelWidth: clamp(width, 420, 720) }),
      setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
      toggleSection: (id) =>
        set((state) => ({
          collapsedSections: {
            ...state.collapsedSections,
            [id]: !state.collapsedSections[id],
          },
        })),
    }),
    {
      name: "crm-ui-settings",
      version: 1,
    }
  )
);
