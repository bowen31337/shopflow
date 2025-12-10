import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useCartStore from '../stores/cartStore';
import CartDrawer from './CartDrawer';
import CategoryNavigation from './CategoryNavigation';
import Autocomplete from './Autocomplete';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const { fetchCart, getItemCount } = useCartStore();
  const location = useLocation();
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);

  // Fetch cart when user logs in or when header mounts
  useEffect(() => {
    if (isAuthenticated()) {
      fetchCart();
    }
  }, [isAuthenticated(), location.pathname]);

  // Get cart item count
  const cartCount = getItemCount();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">SF</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">ShopFlow</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div ref={searchContainerRef} className="w-full relative">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full hover:bg-green-600 transition"
                >
                  Search
                </button>
              </form>
              <Autocomplete
                isVisible={isSearchFocused && searchQuery.length > 0}
                query={searchQuery}
                onNavigate={() => setIsSearchFocused(false)}
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <CategoryNavigation />

            <Link
              to="/products"
              className={`text-gray-700 hover:text-primary transition ${
                location.pathname === '/products' ? 'font-semibold' : ''
              }`}
            >
              Products
            </Link>

            {isAuthenticated() ? (
              <>
                <Link
                  to="/profile"
                  className={`text-gray-700 hover:text-primary transition ${
                    location.pathname === '/profile' ? 'font-semibold' : ''
                  }`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-primary transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-gray-700 hover:text-primary transition ${
                    location.pathname === '/login' ? 'font-semibold' : ''
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`text-gray-700 hover:text-primary transition ${
                    location.pathname === '/register' ? 'font-semibold' : ''
                  }`}
                >
                  Register
                </Link>
              </>
            )}

            <Link to="/cart" className="relative text-gray-700 hover:text-primary transition">
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2"
                aria-label="Open cart"
              >
                <span className="text-2xl">🛒</span>
                <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              </button>
            </Link>
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
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </form>
            </div>
            <nav className="flex flex-col space-y-3">
              {/* Mobile Categories */}
              <div className="py-2">
                <button
                  className="text-gray-700 font-semibold text-left w-full flex items-center justify-between"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <span>Categories</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <Link
                to="/products"
                className={`py-2 ${
                  location.pathname === '/products' ? 'text-primary font-semibold' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>

              {isAuthenticated() ? (
                <>
                  <Link
                    to="/profile"
                    className={`py-2 ${
                      location.pathname === '/profile' ? 'text-primary font-semibold' : 'text-gray-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 text-left py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`py-2 ${
                      location.pathname === '/login' ? 'text-primary font-semibold' : 'text-gray-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`py-2 ${
                      location.pathname === '/register' ? 'text-primary font-semibold' : 'text-gray-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}

              <Link
                to="/cart"
                className={`py-2 ${
                  location.pathname === '/cart' ? 'text-primary font-semibold' : 'text-gray-700'
                }`}
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsCartOpen(true);
                }}
              >
                Cart ({cartCount})
              </Link>
            </nav>
          </div>
        )}
      </div>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
