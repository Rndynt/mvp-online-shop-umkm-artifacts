import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Toaster } from 'sonner';
import { BarChart3, Settings, Clock } from 'lucide-react';
import { Layout } from '@/components/layout';
import ProductsPage from '@/pages/products';
import ProductFormPage from '@/pages/product-form';
import OrdersPage from '@/pages/orders';
import OrderDetailPage from '@/pages/order-detail';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000 },
  },
});

function ComingSoon({ icon: Icon, title }: { icon: typeof Settings; title: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-lg mx-auto w-full min-h-[70vh]">
      <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-teal-100">
        <Clock className="w-8 h-8 text-teal-600" />
      </div>
      <span className="inline-block bg-teal-50 text-teal-700 text-xs font-medium px-3 py-1 rounded-full ring-1 ring-teal-200 mb-4">
        Segera Hadir
      </span>
      <h1 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">{title}</h1>
      <p className="text-slate-500 text-base leading-relaxed">
        Fitur ini sedang dalam pengembangan dan akan hadir segera.
      </p>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={ProductsPage} />
        <Route path="/products/new" component={ProductFormPage} />
        <Route path="/products/:id" component={ProductFormPage} />
        <Route path="/orders" component={OrdersPage} />
        <Route path="/orders/:orderCode" component={OrderDetailPage} />
        <Route path="/analytics">
          <ComingSoon icon={BarChart3} title="Analitik" />
        </Route>
        <Route path="/settings">
          <ComingSoon icon={Settings} title="Pengaturan Toko" />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
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
