import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SetupProvider } from './context/SetupContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { NotificationProvider } from './context/NotificationContext';
import LoadingSpinner from './components/LoadingSpinner';
import SplashScreen   from './components/SplashScreen';

// Layouts (not lazy — they are shells, loaded immediately)
import SetupLayout       from './components/SetupLayout';
import ProtectedRoute    from './components/ProtectedRoute';
import DashboardLayout   from './components/DashboardLayout';
import MarketplaceLayout from './components/MarketplaceLayout';
import AdminLayout       from './components/AdminLayout';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────

// Auth & Landing
const Landing          = lazy(() => import('./pages/Landing'));
const Login            = lazy(() => import('./pages/auth/Login'));
const Register         = lazy(() => import('./pages/auth/Register'));
const VerifyEmail      = lazy(() => import('./pages/auth/VerifyEmail'));
const ForgotPassword   = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword    = lazy(() => import('./pages/auth/ResetPassword'));
const ActiveRoute      = lazy(() => import('./pages/ActiveRoute'));

// Setup
const ProfileSetup         = lazy(() => import('./pages/setup/ProfileSetup'));
const BusinessVerification = lazy(() => import('./pages/setup/BusinessVerification'));
const TeamAccess           = lazy(() => import('./pages/setup/TeamAccess'));
const Preferences          = lazy(() => import('./pages/setup/Preferences'));
const Integrations         = lazy(() => import('./pages/setup/Integrations'));

// Admin
const AdminDashboardOverview = lazy(() => import('./pages/dashboard/AdminDashboardOverview'));
const AdminOrders            = lazy(() => import('./pages/dashboard/AdminOrders'));
const AdminShipments         = lazy(() => import('./pages/dashboard/AdminShipments'));
const AdminInventory         = lazy(() => import('./pages/dashboard/AdminInventory'));
const AdminUsers             = lazy(() => import('./pages/dashboard/AdminUsers'));
const AdminVerification      = lazy(() => import('./pages/dashboard/AdminVerification'));
const AdminReviews           = lazy(() => import('./pages/dashboard/AdminReviews'));


// Supplier Dashboard
const DashboardOverview = lazy(() => import('./pages/dashboard/DashboardOverview'));
const Inventory         = lazy(() => import('./pages/dashboard/Inventory'));
const Orders            = lazy(() => import('./pages/dashboard/Orders'));
const Earnings          = lazy(() => import('./pages/dashboard/Earnings'));
const Notifications     = lazy(() => import('./pages/dashboard/Notifications'));
const Analytics         = lazy(() => import('./pages/dashboard/Analytics'));
const Compliance        = lazy(() => import('./pages/dashboard/Compliance'));
const Support           = lazy(() => import('./pages/dashboard/Support'));
const AddProduct        = lazy(() => import('./pages/dashboard/AddProduct'));
const EditProduct       = lazy(() => import('./pages/dashboard/EditProduct'));
const SupplierProfile   = lazy(() => import('./pages/dashboard/SupplierProfile'));

// Marketplace (Customer)
const MarketplaceHome      = lazy(() => import('./pages/marketplace/MarketplaceHome'));
const ProductDetails       = lazy(() => import('./pages/marketplace/ProductDetails'));
const Cart                 = lazy(() => import('./pages/marketplace/Cart'));
const Checkout             = lazy(() => import('./pages/marketplace/Checkout'));
const OrderSuccess         = lazy(() => import('./pages/marketplace/OrderSuccess'));
const Suppliers            = lazy(() => import('./pages/marketplace/Suppliers'));
const Billing              = lazy(() => import('./pages/marketplace/Billing'));
const MarketplaceAnalytics = lazy(() => import('./pages/marketplace/MarketplaceAnalytics'));
const MarketplaceShipments = lazy(() => import('./pages/marketplace/MarketplaceShipments'));
const MarketplaceInventory = lazy(() => import('./pages/marketplace/MarketplaceInventory'));

// ── Suspense fallback ──────────────────────────────────────────────────────────
function PageLoader() {
  return <LoadingSpinner fullPage message="Loading…" />;
}

function App() {
  const [showSplash, setShowSplash] = React.useState(true);
  const [isExiting, setIsExiting] = React.useState(false);

  React.useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2200);

    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2800);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1041695420311-fakeclientid.apps.googleusercontent.com";

  return (
    <HelmetProvider>
      {showSplash && <SplashScreen isExiting={isExiting} />}
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
        <SetupProvider>
          <CartProvider>
            <NotificationProvider>
              <Router>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public */}
                    <Route path="/"                  element={<Landing />} />
                    <Route path="/login"             element={<Login />} />
                    <Route path="/register"          element={<Register />} />
                    <Route path="/verify-email"      element={<VerifyEmail />} />
                    <Route path="/forgot-password"   element={<ForgotPassword />} />
                    <Route path="/reset-password"    element={<ResetPassword />} />

                    {/* Setup */}
                    <Route element={<SetupLayout />}>
                      <Route path="/setup/profile"       element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
                      <Route path="/setup/verification"  element={<ProtectedRoute><BusinessVerification /></ProtectedRoute>} />
                      <Route path="/setup/team"          element={<ProtectedRoute><TeamAccess /></ProtectedRoute>} />
                      <Route path="/setup/integrations"  element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
                      <Route path="/setup/preferences"   element={<ProtectedRoute><Preferences /></ProtectedRoute>} />
                    </Route>

                    {/* Supplier Dashboard */}
                    <Route path="/dashboard" element={<DashboardLayout />}>
                      <Route index                        element={<DashboardOverview />} />
                      <Route path="inventory"             element={<Inventory />} />
                      <Route path="orders"                element={<Orders />} />
                      <Route path="earnings"              element={<Earnings />} />
                      <Route path="notifications"         element={<Notifications />} />
                      <Route path="analytics"             element={<Analytics />} />
                      <Route path="compliance"            element={<Compliance />} />
                      <Route path="support"               element={<Support />} />
                      <Route path="add-product"           element={<AddProduct />} />
                      <Route path="edit-product/:id"      element={<EditProduct />} />
                      <Route path="profile"               element={<SupplierProfile />} />
                    </Route>

                    {/* Admin */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index               element={<AdminDashboardOverview />} />
                      <Route path="orders"       element={<AdminOrders />} />
                      <Route path="shipments"    element={<AdminShipments />} />
                      <Route path="inventory"    element={<AdminInventory />} />
                      <Route path="users"        element={<AdminUsers />} />
                      <Route path="verification" element={<AdminVerification />} />
                      <Route path="reviews"      element={<AdminReviews />} />
                      <Route path="profile"      element={<SupplierProfile />} />
                    </Route>

                    {/* Marketplace (Customer Buyer) */}
                    <Route path="/marketplace" element={<MarketplaceLayout />}>
                      <Route index                   element={<MarketplaceHome />} />
                      <Route path="product/:id"      element={<ProductDetails />} />
                      <Route path="cart"             element={<Cart />} />
                      <Route path="checkout"         element={<Checkout />} />
                      <Route path="order-success"    element={<OrderSuccess />} />
                      <Route path="suppliers"        element={<Suppliers />} />
                      <Route path="billing"          element={<Billing />} />
                      <Route path="shipments"        element={<MarketplaceShipments />} />
                      <Route path="inventory"        element={<MarketplaceInventory />} />
                      <Route path="analytics"        element={<MarketplaceAnalytics />} />
                    </Route>

                    {/* Redirects */}
                    <Route path="/account/settings" element={<Navigate to="/setup/profile" replace />} />
                    <Route path="/orders/track"     element={<Navigate to="/marketplace/shipments" replace />} />

                    {/* Utilities */}
                    <Route path="/route-scanner" element={<ActiveRoute />} />

                    {/* 404 Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </Router>
            </NotificationProvider>
          </CartProvider>
        </SetupProvider>
      </AuthProvider>
      </GoogleOAuthProvider>
    </HelmetProvider>
  );
}

export default App;
