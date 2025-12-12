import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import BrandPage from './pages/BrandPage';
import Login from './pages/Login';
import Register from './pages/Register';
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
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/wishlist/shared/:userId" element={<SharedWishlist />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:id" element={<OrderDetail />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/promo-codes" element={<AdminPromoCodes />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
