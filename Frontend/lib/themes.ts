export const themes = {
  "dark-premium": {
    name: "Dark Premium",
    colors: {
      bg: "#0a0f1c",
      surface: "#111833",
      card: "#161f3d",
      primary: "#d4a843",
      accent: "#e8c87a",
      text: "#f0f0f0",
      textMuted: "#9aa4b0",
      border: "rgba(212,168,67,0.15)",
      shadow: "rgba(212,168,67,0.08)",
    },
    gradients: {
      hero: "linear-gradient(135deg, #0a0f1c 0%, #161f3d 60%, #1a2a4d 100%)",
      button: "linear-gradient(135deg, #d4a843 0%, #b88a30 100%)",
    },
  },
  "light-modern": {
    name: "Light Modern",
    colors: {
      bg: "#f6f8fa",
      surface: "#ffffff",
      card: "#fdfefe",
      primary: "#0d9488",
      accent: "#14b8a6",
      text: "#1a2332",
      textMuted: "#64748b",
      border: "rgba(13,148,136,0.12)",
      shadow: "rgba(13,148,136,0.06)",
    },
    gradients: {
      hero: "linear-gradient(135deg, #f6f8fa 0%, #edf2f4 60%, #ffffff 100%)",
      button: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
    },
  },
  "futuristic": {
    name: "Futuristic",
    colors: {
      bg: "#0f0218",
      surface: "#1a0a2e",
      card: "#240a3d",
      primary: "#c084fc",
      accent: "#e9d5ff",
      text: "#f0e7ff",
      textMuted: "#b8a0d0",
      border: "rgba(192,132,252,0.2)",
      shadow: "rgba(192,132,252,0.12)",
    },
    gradients: {
      hero: "linear-gradient(135deg, #0f0218 0%, #1a0a2e 60%, #240a3d 100%)",
      button: "linear-gradient(135deg, #c084fc 0%, #9333ea 100%)",
    },
  },
} as const;

export type ThemeKey = keyof typeof themes;
