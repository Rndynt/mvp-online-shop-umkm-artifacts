import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Toaster } from 'sonner';
import { applyThemeToDocument, resolveThemeColors } from '@workspace/shared';
import { Layout } from '@/components/layout';
import ProductsPage from '@/pages/products';
import ProductFormPage from '@/pages/product-form';
import OrdersPage from '@/pages/orders';
import OrderDetailPage from '@/pages/order-detail';
import AnalyticsPage from '@/pages/analytics';
import SettingsPage from '@/pages/settings';
import TemplatesPage from '@/pages/templates';
import DiscountsPage from '@/pages/discounts';
import ShippingSettingsPage from '@/pages/shipping-settings';
import PaymentMethodsPage from '@/pages/payment-methods';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000 },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={ProductsPage} />
        <Route path="/products/new" component={ProductFormPage} />
        <Route path="/products/:id" component={ProductFormPage} />
        <Route path="/orders" component={OrdersPage} />
        <Route path="/orders/:orderCode" component={OrderDetailPage} />
        <Route path="/discounts" component={DiscountsPage} />
        <Route path="/shipping" component={ShippingSettingsPage} />
        <Route path="/payment-methods" component={PaymentMethodsPage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/templates" component={TemplatesPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          applyThemeToDocument(
            resolveThemeColors({
              primary: json.data.primaryColor,
              secondary: json.data.secondaryColor,
              tertiary: json.data.tertiaryColor,
            }),
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
