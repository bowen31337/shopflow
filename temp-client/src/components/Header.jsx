import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuth } from '../stores/authStore';

export default function Header({ onCartClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCartStore();
  const auth = useAuth();
  const location = useLocation();

  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    if (auth.user) {
      loadWishlistCount();
    }
  }, [auth.user]);

  const loadWishlistCount = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        setWishlistCount(data.count || 0);
      }
    } catch (err) {
      console.error('Failed to load wishlist count:', err);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        auth.logout();
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">SF</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">ShopFlow</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="w-full relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 text-white px-4 py-1 rounded-full hover:bg-emerald-700 transition">
                Search
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/products"
              className={`text-gray-700 hover:text-emerald-600 transition ${
                location.pathname === '/products' ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              Products
            </Link>
            {auth.user ? (
              <>
                <Link to="/wishlist" className="text-gray-700 hover:text-emerald-600 transition relative">
                  <span className="text-2xl">❤️</span>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                </Link>
                <Link
                  to="/profile"
                  className={`text-gray-700 hover:text-emerald-600 transition ${
                    location.pathname === '/profile' ? 'text-emerald-600 font-semibold' : ''
                  }`}
                >
                  Profile
                </Link>
                <button onClick={handleLogout} className="text-gray-700 hover:text-emerald-600 transition">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-gray-700 hover:text-emerald-600 transition ${
                    location.pathname === '/login' ? 'text-emerald-600 font-semibold' : ''
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`text-gray-700 hover:text-emerald-600 transition ${
                    location.pathname === '/register' ? 'text-emerald-600 font-semibold' : ''
                  }`}
                >
                  Register
                </Link>
              </>
            )}
            <button
              onClick={onCartClick}
              className="relative text-gray-700 hover:text-emerald-600 transition"
              aria-label="Open cart"
            >
              <span className="text-2xl">🛒</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {items.length}
              </span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <nav className="flex flex-col space-y-3">
              <Link
                to="/products"
                onClick={() => setIsMenuOpen(false)}
                className={`text-gray-700 hover:text-emerald-600 transition ${
                  location.pathname === '/products' ? 'text-emerald-600 font-semibold' : ''
                }`}
              >
                Products
              </Link>
              {auth.user ? (
                <>
                  <Link
                    to="/wishlist"
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-gray-700 hover:text-emerald-600 transition ${
                      location.pathname === '/wishlist' ? 'text-emerald-600 font-semibold' : ''
                    }`}
                  >
                    Wishlist ({wishlistCount})
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-gray-700 hover:text-emerald-600 transition ${
                      location.pathname === '/profile' ? 'text-emerald-600 font-semibold' : ''
                    }`}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-emerald-600 transition text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-gray-700 hover:text-emerald-600 transition ${
                      location.pathname === '/login' ? 'text-emerald-600 font-semibold' : ''
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-gray-700 hover:text-emerald-600 transition ${
                      location.pathname === '/register' ? 'text-emerald-600 font-semibold' : ''
                    }`}
                  >
                    Register
                  </Link>
                </>
              )}
              <button
                onClick={() => {
                  onCartClick();
                  setIsMenuOpen(false);
                }}
                className="text-gray-700 hover:text-emerald-600 transition text-left"
              >
                Cart ({items.length})
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}