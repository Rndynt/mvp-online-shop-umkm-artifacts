'use client';

import { useEffect } from 'react';
import { applyThemeToDocument, resolveThemeColors, type ThemeColors } from '@workspace/shared';

/**
 * Applies store-level theme colors (primary/secondary/tertiary) as CSS vars on <html>.
 *
 * In the Next.js app the initial theme is already rendered server-side (see the
 * root layout), so this hook only needs to react to client-side updates (e.g.
 * after the store owner edits colors in Settings and the storefront re-fetches).
 */
export function useStoreTheme(colors?: Partial<ThemeColors> | null, loaded = false) {
  useEffect(() => {
    if (!loaded) return;
    applyThemeToDocument(resolveThemeColors(colors));
  }, [loaded, colors?.primary, colors?.secondary, colors?.tertiary]);
}
