import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import NotFound from '@/pages/not-found';
import HomePage from '@/pages/home';
import ProductPage from '@/pages/product';
import CheckoutPage from '@/pages/checkout';
import OrderConfirmationPage from '@/pages/order-confirmation';
import TemplatePreviewPage from '@/pages/template-preview';

function ScrollToTop() {
  const [path] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [path]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/preview/:templateId" component={TemplatePreviewPage} />
        <Route path="/products/:slug" component={ProductPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/orders/:orderCode" component={OrderConfirmationPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App({ queryClient }: { queryClient: QueryClient }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
