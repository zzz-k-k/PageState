import { Theme } from "@pagestate/ir";

export const THEME_PRESETS: Theme[] = [
  {
    id: "modern_light",
    name: "Modern Light",
    tokens: {
      colors: {
        "background.primary": "#f8fafc",
        "surface.primary": "#ffffff",
        "text.primary": "#111827",
        "text.muted": "#4b5563",
        accent: "#2563eb"
      },
      fonts: {
        heading: "Inter, ui-sans-serif, system-ui, sans-serif",
        body: "Inter, ui-sans-serif, system-ui, sans-serif"
      },
      spacing: {
        slide: 64
      },
      radii: {
        card: 8
      }
    }
  },
  {
    id: "warm_editorial",
    name: "Warm Editorial",
    tokens: {
      colors: {
        "background.primary": "#fff7ed",
        "surface.primary": "#ffffff",
        "text.primary": "#1f2937",
        "text.muted": "#6b4f3b",
        accent: "#0f766e"
      },
      fonts: {
        heading: "Georgia, ui-serif, serif",
        body: "Inter, ui-sans-serif, system-ui, sans-serif"
      },
      spacing: {
        slide: 72
      },
      radii: {
        card: 6
      }
    }
  },
  {
    id: "ink_focus",
    name: "Ink Focus",
    tokens: {
      colors: {
        "background.primary": "#111827",
        "surface.primary": "#1f2937",
        "text.primary": "#f9fafb",
        "text.muted": "#cbd5e1",
        accent: "#22c55e"
      },
      fonts: {
        heading: "Inter, ui-sans-serif, system-ui, sans-serif",
        body: "Inter, ui-sans-serif, system-ui, sans-serif"
      },
      spacing: {
        slide: 64
      },
      radii: {
        card: 8
      }
    }
  }
];
