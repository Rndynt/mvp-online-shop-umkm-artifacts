import type { ReactNode } from 'react';
import { useGetStorefront } from '@workspace/api-client-react';
import { Header } from '@/components/header';
import { AnnouncementBar } from '@/components/announcement-bar';
import { Footer } from '@/components/footer';
import { CartDrawer } from '@/components/cart-drawer';

interface LayoutProps {
  children: ReactNode;
  mainClassName?: string;
}

export function Layout({ children, mainClassName = 'max-w-5xl mx-auto px-4 sm:px-6 py-8' }: LayoutProps) {
  const { data: storefrontResp } = useGetStorefront();
  const storefront = storefrontResp?.data;

  return (
    <div className="min-h-screen bg-slate-50">
      {storefront?.announcementText && (
        <AnnouncementBar text={storefront.announcementText} />
      )}
      <Header storeName={storefront?.name} />

      <main className={mainClassName}>{children}</main>

      <Footer storeName={storefront?.name} />

      <CartDrawer />
    </div>
  );
}
