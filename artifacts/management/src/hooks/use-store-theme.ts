import { useEffect } from 'react';
import { applyThemeToDocument, resolveThemeColors, type ThemeColors } from '@workspace/shared';

/** Applies store-level theme colors (primary/secondary/tertiary) as CSS vars on <html>. */
export function useStoreTheme(colors?: Partial<ThemeColors> | null) {
  useEffect(() => {
    applyThemeToDocument(resolveThemeColors(colors));
  }, [colors?.primary, colors?.secondary, colors?.tertiary]);
}
