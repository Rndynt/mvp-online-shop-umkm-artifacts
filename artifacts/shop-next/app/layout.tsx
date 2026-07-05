import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { ShopChrome } from '@/components/shop-chrome';
import { serverFetch } from '@/lib/server-api';
import { buildThemeCssVars, resolveThemeColors } from '@workspace/shared';

interface StorefrontData {
  name?: string;
  tagline?: string | null;
  logoUrl?: string | null;
  announcementText?: string | null;
  addressLine1?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  tertiaryColor?: string | null;
}

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'http://localhost:5000');

export async function generateMetadata(): Promise<Metadata> {
  const storefront = await serverFetch<StorefrontData>('/storefront');
  const storeName = storefront?.name ?? 'Kopio';
  const tagline = storefront?.tagline ?? undefined;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: storeName,
      template: `%s | ${storeName}`,
    },
    description: tagline ?? `Belanja online di ${storeName}`,
    openGraph: {
      title: storeName,
      description: tagline ?? undefined,
      images: storefront?.logoUrl ? [{ url: storefront.logoUrl }] : undefined,
      type: 'website',
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const storefront = await serverFetch<StorefrontData>('/storefront');
  const themeVars = buildThemeCssVars(
    resolveThemeColors({
      primary: storefront?.primaryColor ?? undefined,
      secondary: storefront?.secondaryColor ?? undefined,
      tertiary: storefront?.tertiaryColor ?? undefined,
    }),
  );
  return (
    <html lang="id" style={themeVars as React.CSSProperties}>
      <body>
        <Providers>
          <ShopChrome initialStorefront={storefront}>{children}</ShopChrome>
        </Providers>
      </body>
    </html>
  );
}
