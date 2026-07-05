import type { ReactNode } from 'react';
import { useGetStorefront } from '@workspace/api-client-react';
import { Header } from '@/components/header';
import { AnnouncementBar } from '@/components/announcement-bar';
import { Footer } from '@/components/footer';
import { CartDrawer } from '@/components/cart-drawer';
import { QuickAddSheet } from '@/components/quick-add-sheet';
import { useStoreTheme } from '@/hooks/use-store-theme';

interface LayoutProps {
  children: ReactNode;
  mainClassName?: string;
}

export function Layout({ children, mainClassName = 'max-w-5xl mx-auto px-4 sm:px-6 py-8' }: LayoutProps) {
  const { data: storefrontResp, isSuccess: storefrontLoaded } = useGetStorefront();
  const storefront = storefrontResp?.data;

  // Pass `storefrontLoaded` so theme is only applied once we have real data —
  // prevents overwriting the localStorage-cached theme with defaults mid-flight.
  useStoreTheme({
    primary: storefront?.primaryColor ?? undefined,
    secondary: storefront?.secondaryColor ?? undefined,
    tertiary: storefront?.tertiaryColor ?? undefined,
  }, storefrontLoaded);

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
