/**
 * Shared theming system consumed by both the `shop` and `management` apps.
 *
 * Every component in both apps that uses `--primary` / `--secondary` / `--accent`
 * (tertiary) CSS variables — buttons, badges, sidebars, charts, focus rings, etc. —
 * is driven by these values, so a single store-level color change updates the
 * whole product surface consistently.
 */

export interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
}

/** Fallback theme used whenever a store hasn't customized its colors yet. */
export const DEFAULT_THEME: ThemeColors = {
  primary: "#0F766E",
  secondary: "#F1F5F9",
  tertiary: "#7C3AED",
};

export interface ThemePreset {
  id: string;
  name: string;
  colors: ThemeColors;
}

/** At least 8 ready-made palettes the store owner can pick from in one click. */
export const THEME_PRESETS: ThemePreset[] = [
  { id: "teal", name: "Teal Klasik", colors: { primary: "#0F766E", secondary: "#F1F5F9", tertiary: "#7C3AED" } },
  { id: "ocean", name: "Biru Laut", colors: { primary: "#0369A1", secondary: "#E0F2FE", tertiary: "#0891B2" } },
  { id: "sunset", name: "Jingga Senja", colors: { primary: "#EA580C", secondary: "#FFF7ED", tertiary: "#DB2777" } },
  { id: "forest", name: "Hijau Hutan", colors: { primary: "#15803D", secondary: "#F0FDF4", tertiary: "#65A30D" } },
  { id: "royal", name: "Ungu Kerajaan", colors: { primary: "#7C3AED", secondary: "#F5F3FF", tertiary: "#DB2777" } },
  { id: "rose", name: "Merah Muda", colors: { primary: "#E11D48", secondary: "#FFF1F2", tertiary: "#F59E0B" } },
  { id: "midnight", name: "Biru Malam", colors: { primary: "#1E3A8A", secondary: "#EFF6FF", tertiary: "#0D9488" } },
  { id: "amber", name: "Kuning Madu", colors: { primary: "#B45309", secondary: "#FFFBEB", tertiary: "#0F766E" } },
  { id: "slate", name: "Abu Elegan", colors: { primary: "#334155", secondary: "#F8FAFC", tertiary: "#0EA5E9" } },
];

function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.trim().replace(/^#/, "");
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(clean, 16);
  if (clean.length !== 6 || Number.isNaN(num)) {
    return [15, 118, 110]; // fallback: default primary teal
  }
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/** Converts a hex color to an "H S% L%" string, matching this project's CSS var format. */
export function hexToHslString(hex: string): string {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Returns readable foreground HSL ("0 0% 100%" white or "240 10% 12%" near-black) for a hex background. */
export function getContrastForeground(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  // Perceived luminance (WCAG-ish quick heuristic).
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "240 10% 12%" : "0 0% 100%";
}

/** Maps ThemeColors to the full set of CSS custom properties used across the app shells. */
export function buildThemeCssVars(colors: ThemeColors): Record<string, string> {
  const primaryHsl = hexToHslString(colors.primary);
  const secondaryHsl = hexToHslString(colors.secondary);
  const tertiaryHsl = hexToHslString(colors.tertiary);
  const primaryFg = getContrastForeground(colors.primary);
  const secondaryFg = getContrastForeground(colors.secondary);
  const tertiaryFg = getContrastForeground(colors.tertiary);

  return {
    "--primary": primaryHsl,
    "--primary-foreground": primaryFg,
    "--secondary": secondaryHsl,
    "--secondary-foreground": secondaryFg,
    "--accent": tertiaryHsl,
    "--accent-foreground": tertiaryFg,
    "--ring": primaryHsl,
    "--sidebar-primary": primaryHsl,
    "--sidebar-primary-foreground": primaryFg,
    "--sidebar-ring": primaryHsl,
    "--sidebar-accent": tertiaryHsl,
    "--sidebar-accent-foreground": tertiaryFg,
    "--chart-1": primaryHsl,
    "--chart-2": tertiaryHsl,
    "--chart-3": secondaryHsl,
  };
}

interface StyleSettable {
  style: {
    setProperty(name: string, value: string): void;
  };
}

/** localStorage key used to persist the last-known theme so the shop can restore
 *  it synchronously before React mounts, preventing a flash of the default color. */
export const THEME_CACHE_KEY = "rukolite_theme_v1";

/** Applies the theme's CSS variables directly onto a DOM element (defaults to <html>).
 *  The initial theme is bootstrapped via synchronous XHR in each app's index.html
 *  before first paint — this function handles subsequent updates (e.g. after the
 *  storefront API responds or the store owner saves new colors in Settings). */
export function applyThemeToDocument(colors: ThemeColors, root?: StyleSettable): void {
  const doc = (globalThis as { document?: { documentElement?: StyleSettable } }).document;
  const target = root ?? doc?.documentElement;
  if (!target) return;
  const vars = buildThemeCssVars(colors);
  for (const [key, value] of Object.entries(vars)) {
    target.style.setProperty(key, value);
  }
}

/** Fills in any missing color with the fallback default. */
export function resolveThemeColors(partial?: Partial<ThemeColors> | null): ThemeColors {
  return {
    primary: partial?.primary || DEFAULT_THEME.primary,
    secondary: partial?.secondary || DEFAULT_THEME.secondary,
    tertiary: partial?.tertiary || DEFAULT_THEME.tertiary,
  };
}
