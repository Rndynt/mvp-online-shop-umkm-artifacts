import { useEffect } from 'react';
import { applyThemeToDocument, resolveThemeColors, type ThemeColors } from '@workspace/shared';

/**
 * Applies store-level theme colors (primary/secondary/tertiary) as CSS vars on <html>.
 *
 * `loaded` must be true before any theme is applied — this prevents overwriting
 * the localStorage-cached theme (set by index.html's inline script) with the
 * default teal while the storefront API is still in flight.
 */
export function useStoreTheme(colors?: Partial<ThemeColors> | null, loaded = false) {
  useEffect(() => {
    if (!loaded) return;
    applyThemeToDocument(resolveThemeColors(colors));
  }, [loaded, colors?.primary, colors?.secondary, colors?.tertiary]);
}
