import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import AdminGuard from './components/AdminGuard';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import BrandPage from './pages/BrandPage';
import Login from './pages/Login';
import Register from './pages/Register';
import EmailVerification from './pages/EmailVerification';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';
import OrderDetail from './pages/OrderDetail';
import Wishlist from './pages/Wishlist';
import SharedWishlist from './pages/SharedWishlist';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminCustomers from './pages/AdminCustomers';
import AdminCategories from './pages/AdminCategories';
import AdminPromoCodes from './pages/AdminPromoCodes';
import AdminInventory from './pages/AdminInventory';
import ProductInventoryDetail from './pages/ProductInventoryDetail';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminReports from './pages/AdminReports';
import useAuthStore from './stores/authStore';
import api from './api';

function App() {
  // Initialize API token from persisted storage
  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (token) {
      api.setAuthToken(token);
    }
  }, []);
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/brands/:slug" element={<BrandPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:token" element={<EmailVerification />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/wishlist/shared/:userId" element={<SharedWishlist />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:id" element={<OrderDetail />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminGuard>
              <AdminDashboard />
            </AdminGuard>
          } />
          <Route path="/admin/analytics" element={
            <AdminGuard>
              <AdminAnalytics />
            </AdminGuard>
          } />
          <Route path="/admin/reports" element={
            <AdminGuard>
              <AdminReports />
            </AdminGuard>
          } />
          <Route path="/admin/products" element={
            <AdminGuard>
              <AdminProducts />
            </AdminGuard>
          } />
          <Route path="/admin/orders" element={
            <AdminGuard>
              <AdminOrders />
            </AdminGuard>
          } />
          <Route path="/admin/customers" element={
            <AdminGuard>
              <AdminCustomers />
            </AdminGuard>
          } />
          <Route path="/admin/categories" element={
            <AdminGuard>
              <AdminCategories />
            </AdminGuard>
          } />
          <Route path="/admin/promo-codes" element={
            <AdminGuard>
              <AdminPromoCodes />
            </AdminGuard>
          } />
          <Route path="/admin/inventory" element={
            <AdminGuard>
              <AdminInventory />
            </AdminGuard>
          } />
          <Route path="/admin/inventory/:id" element={
            <AdminGuard>
              <ProductInventoryDetail />
            </AdminGuard>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
