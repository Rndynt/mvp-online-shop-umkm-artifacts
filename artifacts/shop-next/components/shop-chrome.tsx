'use client';

import type { ReactNode } from 'react';
import { useGetStorefront } from '@workspace/api-client-react';
import { Header } from '@/components/header';
import { AnnouncementBar } from '@/components/announcement-bar';
import { Footer } from '@/components/footer';
import { CartDrawer } from '@/components/cart-drawer';
import { QuickAddSheet } from '@/components/quick-add-sheet';
import { useStoreTheme } from '@/hooks/use-store-theme';

interface StorefrontSnapshot {
  name?: string;
  logoUrl?: string | null;
  tagline?: string | null;
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

interface ShopChromeProps {
  children: ReactNode;
  mainClassName?: string;
  /** Server-fetched storefront snapshot, used as the initial render before the
   *  client-side query hook (re)hydrates — avoids a flash of empty header/footer. */
  initialStorefront?: StorefrontSnapshot | null;
}

export function ShopChrome({
  children,
  mainClassName = 'max-w-5xl mx-auto px-4 sm:px-6 py-8',
  initialStorefront,
}: ShopChromeProps) {
  const { data: storefrontResp, isSuccess: storefrontLoaded } = useGetStorefront();
  const storefront = storefrontResp?.data ?? initialStorefront ?? undefined;

  useStoreTheme(
    {
      primary: storefront?.primaryColor ?? undefined,
      secondary: storefront?.secondaryColor ?? undefined,
      tertiary: storefront?.tertiaryColor ?? undefined,
    },
    storefrontLoaded,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {storefront?.announcementText && (
        <AnnouncementBar text={storefront.announcementText} />
      )}
      <Header storeName={storefront?.name} logoUrl={storefront?.logoUrl} />

      <main className={mainClassName}>{children}</main>

      <Footer
        storeName={storefront?.name}
        tagline={storefront?.tagline}
        address={{
          line1: storefront?.addressLine1,
          city: storefront?.city,
          province: storefront?.province,
          postalCode: storefront?.postalCode,
        }}
        contact={{
          email: storefront?.contactEmail,
          phone: storefront?.contactPhone,
        }}
      />

      <CartDrawer />
      <QuickAddSheet />
    </div>
  );
}
