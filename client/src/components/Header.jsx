import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useCartStore from '../stores/cartStore';
import CartDrawer from './CartDrawer';
import CategoryNavigation from './CategoryNavigation';
import Autocomplete from './Autocomplete';
import SearchHistory from './SearchHistory';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [previousPage, setPreviousPage] = useState(() => {
  return sessionStorage.getItem('previousPage') || '/products';
});
  const { user, logout, isAuthenticated } = useAuthStore();
  const { fetchCart, fetchWishlist, getItemCount, getWishlistCount } = useCartStore();
  const location = useLocation();
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = (history) => {
    try {
      localStorage.setItem('searchHistory', JSON.stringify(history.slice(0, 10))); // Keep only last 10 searches
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  // Track previous page for continue shopping functionality
  useEffect(() => {
    // Don't update previous page when navigating to cart, login, or register pages
    const excludedPaths = ['/cart', '/login', '/register', '/checkout'];
    if (!excludedPaths.includes(location.pathname)) {
      const fullPath = location.pathname + location.search;
      setPreviousPage(fullPath);
      sessionStorage.setItem('previousPage', fullPath);
    }
  }, [location.pathname, location.search]);

  // Fetch cart when user logs in or when header mounts
  useEffect(() => {
    if (isAuthenticated()) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated(), location.pathname]);

  // Get cart and wishlist item counts
  const cartCount = getItemCount();
  const wishlistCount = getWishlistCount();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      // Add to search history
      const newHistory = [trimmedQuery, ...searchHistory.filter(item => item.toLowerCase() !== trimmedQuery.toLowerCase())];
      setSearchHistory(newHistory);
      saveSearchHistory(newHistory);

      navigate(`/products?search=${encodeURIComponent(trimmedQuery)}`);
      setIsMenuOpen(false);
      setShowSearchHistory(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    // Show search history if query is empty
    if (!searchQuery.trim()) {
      setShowSearchHistory(true);
    }
  };

  const handleSearchBlur = (e) => {
    // Only close suggestions if clicking outside the search container
    if (searchContainerRef.current && !searchContainerRef.current.contains(e.relatedTarget)) {
      setIsSearchFocused(false);
      setShowSearchHistory(false);
    }
  };

  const handleSearchHistorySelect = (historyItem) => {
    setSearchQuery(historyItem);
    setShowSearchHistory(false);
    handleSearch({ preventDefault: () => {}, key: '' });
  };

  const handleContinueShopping = () => {
    navigate(previousPage);
  };

  return (
    <header className="header bg-white shadow-sm sticky top-0 z-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-md">
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
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  placeholder="Search products..."
                  className="search-input w-full px-4 py-2 border-2 border-gray-200 rounded-full focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] transition-all duration-200 bg-white"
                />
                <button
                  type="submit"
                  className="search-button absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-600 transition-all duration-200 font-semibold"
                  aria-label="Search"
                >
                  Search
                </button>
              </form>
              <Autocomplete
                isVisible={isSearchFocused && searchQuery.length > 0}
                query={searchQuery}
                onNavigate={() => setIsSearchFocused(false)}
              />
              <SearchHistory
                isVisible={showSearchHistory && searchHistory.length > 0}
                history={searchHistory}
                onSelect={handleSearchHistorySelect}
                onClose={() => setShowSearchHistory(false)}
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <CategoryNavigation />

            <Link
              to="/products"
              className={`nav-link text-gray-700 transition-all duration-200 hover:text-primary hover:bg-primary-50 hover:-translate-y-1 rounded-md px-3 py-2 ${
                location.pathname === '/products' ? 'text-primary font-semibold bg-primary-50' : ''
              }`}
            >
              Products
            </Link>

            {isAuthenticated() ? (
              <>
                <Link
                  to="/profile"
                  className={`nav-link text-gray-700 transition-all duration-200 hover:text-primary hover:bg-primary-50 hover:-translate-y-1 rounded-md px-3 py-2 ${
                    location.pathname === '/profile' ? 'text-primary font-semibold bg-primary-50' : ''
                  }`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="nav-link text-gray-700 transition-all duration-200 hover:text-primary hover:bg-primary-50 hover:-translate-y-1 rounded-md px-3 py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`nav-link text-gray-700 transition-all duration-200 hover:text-primary hover:bg-primary-50 hover:-translate-y-1 rounded-md px-3 py-2 ${
                    location.pathname === '/login' ? 'text-primary font-semibold bg-primary-50' : ''
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`nav-link text-gray-700 transition-all duration-200 hover:text-primary hover:bg-primary-50 hover:-translate-y-1 rounded-md px-3 py-2 ${
                    location.pathname === '/register' ? 'text-primary font-semibold bg-primary-50' : ''
                  }`}
                >
                  Register
                </Link>
              </>
            )}

            <Link to="/wishlist" className="nav-link relative text-gray-700 transition-all duration-200 hover:text-primary hover:bg-primary-50 hover:-translate-y-1 rounded-md p-2">
              <span className="text-2xl">❤️</span>
              <span className="badge badge-primary absolute -top-1 -right-1 text-xs min-w-[20px] h-5 flex items-center justify-center">
                {wishlistCount}
              </span>
            </Link>

            <Link to="/cart" className="nav-link relative text-gray-700 transition-all duration-200 hover:text-primary hover:bg-primary-50 hover:-translate-y-1 rounded-md p-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2"
                aria-label="Open cart"
              >
                <span className="text-2xl">🛒</span>
                <span className="badge badge-primary text-xs min-w-[20px] h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              </button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="mb-4">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  placeholder="Search products..."
                  className="search-input w-full px-4 py-2 border-2 border-gray-200 rounded-full focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] transition-all duration-200 bg-white"
                />
              </form>
              <SearchHistory
                isVisible={showSearchHistory && searchHistory.length > 0}
                history={searchHistory}
                onSelect={handleSearchHistorySelect}
                onClose={() => setShowSearchHistory(false)}
              />
            </div>
            <nav className="flex flex-col space-y-3">
              {/* Mobile Categories */}
              <div className="py-2">
                <button
                  className="text-gray-700 font-semibold text-left w-full flex items-center justify-between hover:text-primary transition-colors"
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
                className={`py-2 px-2 ${
                  location.pathname === '/products' ? 'text-primary font-semibold' : 'text-gray-700'
                } hover:text-primary hover:bg-primary-50 rounded-md transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>

              {isAuthenticated() ? (
                <>
                  <Link
                    to="/profile"
                    className={`py-2 px-2 ${
                      location.pathname === '/profile' ? 'text-primary font-semibold' : 'text-gray-700'
                    } hover:text-primary hover:bg-primary-50 rounded-md transition-colors`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 text-left py-2 px-2 hover:text-primary hover:bg-primary-50 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`py-2 px-2 ${
                      location.pathname === '/login' ? 'text-primary font-semibold' : 'text-gray-700'
                    } hover:text-primary hover:bg-primary-50 rounded-md transition-colors`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`py-2 px-2 ${
                      location.pathname === '/register' ? 'text-primary font-semibold' : 'text-gray-700'
                    } hover:text-primary hover:bg-primary-50 rounded-md transition-colors`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}

              <Link
                to="/wishlist"
                className={`py-2 px-2 ${
                  location.pathname === '/wishlist' ? 'text-primary font-semibold' : 'text-gray-700'
                } hover:text-primary hover:bg-primary-50 rounded-md transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                ❤️ Wishlist ({wishlistCount})
              </Link>

              <Link
                to="/cart"
                className={`py-2 px-2 ${
                  location.pathname === '/cart' ? 'text-primary font-semibold' : 'text-gray-700'
                } hover:text-primary hover:bg-primary-50 rounded-md transition-colors`}
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
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        continueShopping={handleContinueShopping}
      />
    </header>
  );
}
