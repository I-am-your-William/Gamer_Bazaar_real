import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { AdminAuthProvider, useAdminAuth } from "@/hooks/useAdminAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Verify from "@/pages/verify";
import QRScannerPage from "@/pages/qr-scanner";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminInventory from "@/pages/admin/inventory";
import AddInventory from "@/pages/admin/add-inventory";
import InventoryUnits from "@/pages/admin/inventory-units";
import AdminOrders from "@/pages/admin/orders";
import AdminQRManagement from "@/pages/admin/qr-management";
import AdminLogin from "@/pages/admin-login";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isAdminLoggedIn } = useAdminAuth();
  
  console.log('Router state:', { isAuthenticated, isLoading, isAdminLoggedIn });

  // Admin routes take priority
  if (isAdminLoggedIn) {
    return (
      <Switch>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/inventory" component={AdminInventory} />
        <Route path="/admin/add-inventory" component={AddInventory} />
        <Route path="/admin/inventory-units" component={InventoryUnits} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/qr-management" component={AdminQRManagement} />
        <Route path="/admin-login" component={() => { window.location.href = '/admin'; return null; }} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/verify/:code" component={Verify} />
          <Route path="/qr-scanner" component={QRScannerPage} />
          <Route path="/products" component={Products} />
          <Route path="/products/:slug" component={ProductDetail} />
          <Route path="/admin-login" component={AdminLogin} />
          <Route component={NotFound} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/products/:slug" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/verify/:code" component={Verify} />
          <Route path="/qr-scanner" component={QRScannerPage} />
          <Route path="/admin-login" component={AdminLogin} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="gamer-bazaar-theme">
        <TooltipProvider>
          <AdminAuthProvider>
            <Router />
            <Toaster />
          </AdminAuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
