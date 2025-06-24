import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { useLocalAuth, LocalAuthProvider } from "@/hooks/useLocalAuth";
import { AdminAuthProvider, useAdminAuth } from "@/hooks/useAdminAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Orders from "@/pages/orders";
import OrderTracking from "@/pages/order-tracking";
import OrderSuccess from "@/pages/order-success";
import Verify from "@/pages/verify";
import QRScannerPage from "@/pages/qr-scanner";
import ProductAuthentication from "@/pages/product-authentication";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminInventory from "@/pages/admin/inventory";
import AddInventoryUnit from "@/pages/admin/add-inventory-unit";
import AddProduct from "@/pages/admin/add-product";
import InventoryUnits from "@/pages/admin/inventory-units";
import AdminOrders from "@/pages/admin/orders";
import AdminQRManagement from "@/pages/admin/qr-management";
import AdminLogin from "@/pages/admin-login";
import AuthPage from "@/pages/auth-page";

function Router() {
  const { user, isLoading } = useLocalAuth();
  const isAuthenticated = !!user;
  const { isAdminLoggedIn } = useAdminAuth();

  // Add loading spinner for better UX
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-black">
        <div className="text-electric text-xl">Loading...</div>
      </div>
    );
  }
  
  console.log('Router state:', { isAuthenticated, isLoading, isAdminLoggedIn });

  // Admin routes take priority
  if (isAdminLoggedIn) {
    return (
      <Switch>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/inventory" component={AdminInventory} />
        <Route path="/admin/add-inventory" component={AddInventory} />
        <Route path="/admin/add-product" component={AddProduct} />
        <Route path="/admin/inventory-units" component={InventoryUnits} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/qr-management" component={AdminQRManagement} />
        <Route path="/admin-login" component={() => { window.location.href = '/admin'; return null; }} />
        <Route path="/auth" component={AuthPage} />
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
          <Route path="/authenticate/:code" component={ProductAuthentication} />
          <Route path="/products" component={Products} />
          <Route path="/products/:slug" component={ProductDetail} />
          <Route path="/admin-login" component={AdminLogin} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/products/:slug" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/orders" component={Orders} />
          <Route path="/orders/:id" component={OrderTracking} />
          <Route path="/order-success/:id" component={OrderSuccess} />
          <Route path="/verify/:code" component={Verify} />
          <Route path="/qr-scanner" component={QRScannerPage} />
          <Route path="/authenticate/:code" component={ProductAuthentication} />
          <Route path="/admin-login" component={AdminLogin} />
          <Route path="/auth" component={AuthPage} />
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
          <LocalAuthProvider>
            <AdminAuthProvider>
              <Router />
              <Toaster />
            </AdminAuthProvider>
          </LocalAuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
