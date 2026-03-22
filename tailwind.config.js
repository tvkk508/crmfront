/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Semantic (canonical) — prefer `ui-*` in new code */
        ui: {
          background: "rgb(var(--ui-color-background) / <alpha-value>)",
          surface: "rgb(var(--ui-color-surface) / <alpha-value>)",
          "surface-muted": "rgb(var(--ui-color-surface-muted) / <alpha-value>)",
          border: "rgb(var(--ui-color-border) / <alpha-value>)",
          text: "rgb(var(--ui-color-text) / <alpha-value>)",
          "text-muted": "rgb(var(--ui-color-text-muted) / <alpha-value>)",
          accent: "rgb(var(--ui-color-accent) / <alpha-value>)",
          success: "rgb(var(--ui-color-success) / <alpha-value>)",
          warn: "rgb(var(--ui-color-warn) / <alpha-value>)",
          danger: "rgb(var(--ui-color-danger) / <alpha-value>)",
          info: "rgb(var(--ui-color-info) / <alpha-value>)",
          "focus-ring": "rgb(var(--ui-color-focus-ring) / <alpha-value>)",
        },
        /* Legacy colors (backward compatibility; same values as semantic) */
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-muted": "rgb(var(--color-surface-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warn: "rgb(var(--color-warn) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        /* Platform-develop colors - Text */
        "text-primary": "rgb(var(--global-primary-text-color) / <alpha-value>)",
        "text-secondary": "rgb(var(--global-secondary-text-color) / <alpha-value>)",
        "text-tertiary": "rgb(var(--global-tertiary-text-color) / <alpha-value>)",
        "text-disabled": "rgb(var(--global-disabled-text-color) / <alpha-value>)",
        "text-accent": "rgb(var(--global-accent-text-color) / <alpha-value>)",
        /* Platform-develop colors - Buttons */
        "button-primary": "rgb(var(--primary-button-default) / <alpha-value>)",
        "button-primary-hover": "rgb(var(--primary-button-hovered) / <alpha-value>)",
        "button-primary-pressed": "rgb(var(--primary-button-pressed) / <alpha-value>)",
        "button-secondary": "rgb(var(--secondary-button-default) / <alpha-value>)",
        "button-secondary-hover": "rgb(var(--secondary-button-hovered) / <alpha-value>)",
        "button-positive": "rgb(var(--positive-button-default) / <alpha-value>)",
        "button-positive-hover": "rgb(var(--positive-button-hovered) / <alpha-value>)",
        "button-negative": "rgb(var(--negative-button-default) / <alpha-value>)",
        "button-negative-hover": "rgb(var(--negative-button-hovered) / <alpha-value>)",
        /* Platform-develop colors - States */
        "state-positive": "rgb(var(--theme-state-positive-color) / <alpha-value>)",
        "state-negative": "rgb(var(--theme-state-negative-color) / <alpha-value>)",
      },
      spacing: {
        "ui-0": "var(--ui-space-0)",
        "ui-1": "var(--ui-space-1)",
        "ui-1.5": "var(--ui-space-1_5)",
        "ui-2": "var(--ui-space-2)",
        "ui-3": "var(--ui-space-3)",
        "ui-4": "var(--ui-space-4)",
        "ui-5": "var(--ui-space-5)",
        "ui-6": "var(--ui-space-6)",
        "ui-8": "var(--ui-space-8)",
        "ui-10": "var(--ui-space-10)",
      },
      borderRadius: {
        /* Semantic radii */
        "ui-sm": "var(--ui-radius-sm)",
        "ui-md": "var(--ui-radius-md)",
        "ui-lg": "var(--ui-radius-lg)",
        "ui-xl": "var(--ui-radius-xl)",
        "ui-full": "var(--ui-radius-full)",
        /* Legacy numeric keys */
        "8": "var(--radius-8)",
        "10": "var(--radius-10)",
        "12": "var(--radius-12)",
        /* Platform-develop border radius */
        min: "var(--min-border-radius)",
        xs: "var(--extra-small-border-radius)",
        sm: "var(--small-border-radius)",
        md: "var(--medium-border-radius)",
        lg: "var(--large-border-radius)",
      },
      boxShadow: {
        /* Canonical pair */
        "ui-elevation": "var(--ui-shadow-elevation)",
        "ui-overlay": "var(--ui-shadow-overlay)",
        /* Legacy aliases */
        soft: "var(--shadow-1)",
        deep: "var(--shadow-2)",
        /* Platform-develop shadows */
        popover:
          "0 var(--global-popover-shadow-x) var(--global-popover-shadow-y) 0 rgba(0, 0, 0, 0.12), 0 0 0 var(--global-popover-shadow-blur) rgba(0, 0, 0, 0.08)",
        modal:
          "0 var(--global-modal-shadow-x) var(--global-modal-shadow-y) var(--global-modal-shadow-spread) rgba(0, 0, 0, 0.15), 0 0 0 var(--global-modal-shadow-blur) rgba(0, 0, 0, 0.1)",
      },
      fontSize: {
        /* Semantic type scale */
        "ui-page-title": [
          "var(--ui-font-page-title-size)",
          {
            lineHeight: "var(--ui-font-page-title-line)",
            fontWeight: "var(--ui-font-page-title-weight)",
          },
        ],
        "ui-section-title": [
          "var(--ui-font-section-title-size)",
          {
            lineHeight: "var(--ui-font-section-title-line)",
            fontWeight: "var(--ui-font-section-title-weight)",
          },
        ],
        "ui-body": [
          "var(--ui-font-body-size)",
          { lineHeight: "var(--ui-font-body-line)", fontWeight: "var(--ui-font-body-weight)" },
        ],
        "ui-body-lg": [
          "var(--ui-font-body-large-size)",
          { lineHeight: "var(--ui-font-body-large-line)" },
        ],
        "ui-caption": [
          "var(--ui-font-caption-size)",
          {
            lineHeight: "var(--ui-font-caption-line)",
            fontWeight: "var(--ui-font-caption-weight)",
          },
        ],
        "ui-mono-id": [
          "var(--ui-font-mono-id-size)",
          {
            lineHeight: "var(--ui-font-mono-id-line)",
            fontWeight: "var(--ui-font-mono-id-weight)",
          },
        ],
        /* Legacy numeric keys */
        "12": "var(--font-size-12)",
        "13": "var(--font-size-13)",
        "14": "var(--font-size-14)",
        "16": "var(--font-size-16)",
      },
      lineHeight: {
        "ui-page-title": "var(--ui-font-page-title-line)",
        "ui-section-title": "var(--ui-font-section-title-line)",
        "ui-body": "var(--ui-font-body-line)",
        "ui-body-lg": "var(--ui-font-body-large-line)",
        "ui-caption": "var(--ui-font-caption-line)",
        "ui-mono-id": "var(--ui-font-mono-id-line)",
        tight: "var(--line-height-tight)",
        base: "var(--line-height-base)",
      },
      fontWeight: {
        "ui-page-title": "var(--ui-font-page-title-weight)",
        "ui-section-title": "var(--ui-font-section-title-weight)",
        "ui-body": "var(--ui-font-body-weight)",
        "ui-caption": "var(--ui-font-caption-weight)",
        "ui-mono-id": "var(--ui-font-mono-id-weight)",
      },
      maxWidth: {
        "ui-readable": "65ch",
        "ui-modal-sm": "24rem",
        "ui-modal-md": "40rem",
        "ui-modal-lg": "56rem",
      },
      minWidth: {
        "ui-touch": "44px",
      },
      fontFamily: {
        "ui-mono": [
          '"IBM Plex Mono"',
          "ui-monospace",
          "Consolas",
          "SFMono-Regular",
          "monospace",
        ],
      },
      opacity: {
        "ui-disabled": "var(--ui-opacity-disabled)",
        "ui-loading": "var(--ui-opacity-loading)",
      },
      transitionDuration: {
        "ui-fast": "150ms",
        "ui-base": "200ms",
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [],
};
