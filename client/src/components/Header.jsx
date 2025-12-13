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
    navigate('/');
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
          <nav className="hidden md:flex items-center space-x-2" aria-label="Main navigation">
            <CategoryNavigation />

            <Link
              to="/products"
              className={`nav-link text-gray-700 transition-all duration-200 hover:text-primary hover:bg-primary-50 hover:-translate-y-1 rounded-md px-4 py-3 font-medium ${
                location.pathname === '/products' ? 'text-primary font-semibold bg-primary-50' : ''
              }`}
              aria-label="Products"
            >
              Products
            </Link>

            {isAuthenticated() ? (
              <>
                <Link
                  to="/profile"
                  className={`nav-link text-gray-700 transition-all duration-200 hover:text-primary hover:bg-primary-50 hover:-translate-y-1 rounded-md px-4 py-3 font-medium ${
                    location.pathname === '/profile' ? 'text-primary font-semibold bg-primary-50' : ''
                  }`}
                  aria-label="Profile"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="nav-link text-gray-700 transition-all duration-200 hover:text-primary hover:bg-primary-50 hover:-translate-y-1 rounded-md px-4 py-3 font-medium"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`nav-link text-gray-700 transition-all duration-200 hover:text-primary hover:bg-primary-50 hover:-translate-y-1 rounded-md px-4 py-3 font-medium ${
                    location.pathname === '/login' ? 'text-primary font-semibold bg-primary-50' : ''
                  }`}
                  aria-label="Login"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`nav-link text-gray-700 transition-all duration-200 hover:text-primary hover:bg-primary-50 hover:-translate-y-1 rounded-md px-4 py-3 font-medium ${
                    location.pathname === '/register' ? 'text-primary font-semibold bg-primary-50' : ''
                  }`}
                  aria-label="Register"
                >
                  Register
                </Link>
              </>
            )}

            <Link to="/wishlist" className="nav-link relative text-gray-700 transition-all duration-200 hover:text-primary hover:bg-primary-50 hover:-translate-y-1 rounded-md p-3 group" aria-label={`Wishlist (${wishlistCount} items)`}>
              <span className="text-2xl group-hover:scale-110 transition-transform">❤️</span>
              <span className="badge badge-primary absolute -top-1 -right-1 text-xs min-w-[20px] h-5 flex items-center justify-center bg-primary text-white font-semibold rounded-full">
                {wishlistCount}
              </span>
            </Link>

            <Link to="/cart" className="nav-link relative text-gray-700 transition-all duration-200 hover:text-primary hover:bg-primary-50 hover:-translate-y-1 rounded-md p-3 group" aria-label={`Cart (${cartCount} items)`}>
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-3"
                aria-label={`Open cart with ${cartCount} items`}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">🛒</span>
                <span className="badge badge-primary text-xs min-w-[20px] h-5 flex items-center justify-center bg-primary text-white font-semibold rounded-full">
                  {cartCount}
                </span>
              </button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-3 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-in slide-in-from-top-5 duration-200" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Mobile menu">
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
                  className="search-input w-full px-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] transition-all duration-200 bg-white text-lg"
                  aria-label="Search products"
                />
              </form>
              <SearchHistory
                isVisible={showSearchHistory && searchHistory.length > 0}
                history={searchHistory}
                onSelect={handleSearchHistorySelect}
                onClose={() => setShowSearchHistory(false)}
              />
            </div>
            <nav className="flex flex-col space-y-2" aria-label="Mobile navigation">
              {/* Mobile Categories */}
              <div className="py-3 border-b border-gray-100">
                <button
                  className="text-gray-700 font-semibold text-left w-full flex items-center justify-between hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Browse categories"
                >
                  <span className="text-lg">🛍️ Categories</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <Link
                to="/products"
                className={`py-3 px-4 text-lg ${
                  location.pathname === '/products' ? 'text-primary font-semibold bg-primary-50' : 'text-gray-700'
                } hover:text-primary hover:bg-primary-50 rounded-lg transition-colors`}
                onClick={() => setIsMenuOpen(false)}
                aria-label="Products"
              >
                🛍️ Products
              </Link>

              {isAuthenticated() ? (
                <>
                  <Link
                    to="/profile"
                    className={`py-3 px-4 text-lg ${
                      location.pathname === '/profile' ? 'text-primary font-semibold bg-primary-50' : 'text-gray-700'
                    } hover:text-primary hover:bg-primary-50 rounded-lg transition-colors`}
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Profile"
                  >
                    👤 Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="py-3 px-4 text-lg text-gray-700 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors text-left"
                    aria-label="Logout"
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`py-3 px-4 text-lg ${
                      location.pathname === '/login' ? 'text-primary font-semibold bg-primary-50' : 'text-gray-700'
                    } hover:text-primary hover:bg-primary-50 rounded-lg transition-colors`}
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Login"
                  >
                    🔐 Login
                  </Link>
                  <Link
                    to="/register"
                    className={`py-3 px-4 text-lg ${
                      location.pathname === '/register' ? 'text-primary font-semibold bg-primary-50' : 'text-gray-700'
                    } hover:text-primary hover:bg-primary-50 rounded-lg transition-colors`}
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Register"
                  >
                    ✏️ Register
                  </Link>
                </>
              )}

              <div className="flex space-x-4 py-3 border-t border-gray-100">
                <Link
                  to="/wishlist"
                  className="flex items-center gap-3 py-3 px-4 text-lg text-gray-700 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors flex-1"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label={`Wishlist (${wishlistCount} items)`}
                >
                  <span className="text-2xl">❤️</span>
                  <span className="font-semibold">Wishlist</span>
                  <span className="badge badge-primary ml-auto text-xs min-w-[20px] h-6 flex items-center justify-center bg-primary text-white font-semibold rounded-full">
                    {wishlistCount}
                  </span>
                </Link>

                <button
                  onClick={() => {
                    setIsCartOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 py-3 px-4 text-lg text-gray-700 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors flex-1"
                  aria-label={`Cart (${cartCount} items)`}
                >
                  <span className="text-2xl">🛒</span>
                  <span className="font-semibold">Cart</span>
                  <span className="badge badge-primary ml-auto text-xs min-w-[20px] h-6 flex items-center justify-center bg-primary text-white font-semibold rounded-full">
                    {cartCount}
                  </span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>

      <div className={`md:hidden fixed inset-y-0 right-0 z-50 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="w-72 bg-white shadow-xl h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-4 space-y-2">
              <Link
                to="/"
                className={`block py-2 px-2 rounded-md ${
                  location.pathname === '/' ? 'text-primary font-semibold bg-primary-50' : 'text-gray-700'
                } hover:text-primary hover:bg-primary-50 transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className={`block py-2 px-2 rounded-md ${
                  location.pathname === '/products' ? 'text-primary font-semibold bg-primary-50' : 'text-gray-700'
                } hover:text-primary hover:bg-primary-50 transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/brands"
                className={`block py-2 px-2 rounded-md ${
                  location.pathname === '/brands' ? 'text-primary font-semibold bg-primary-50' : 'text-gray-700'
                } hover:text-primary hover:bg-primary-50 transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                Brands
              </Link>
            </div>

            {/* Categories in Mobile Menu */}
            {categories.length > 0 && (
              <div className="mt-4 px-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Categories</h3>
                <div className="space-y-1">
                  {categories.filter(cat => !cat.parent_id).map((category) => (
                    <div key={category.id}>
                      <Link
                        to={`/products?category=${category.slug}`}
                        className={`block py-2 px-2 rounded-md ${
                          activeCategory === category.slug ? 'text-primary font-semibold bg-primary-50' : 'text-gray-700'
                        } hover:text-primary hover:bg-primary-50 transition-colors`}
                        onClick={() => {
                          setActiveCategory(category.slug);
                          setIsMenuOpen(false);
                        }}
                      >
                        {category.name}
                      </Link>
                      {activeCategory === category.slug && category.subcategories && category.subcategories.length > 0 && (
                        <div className="ml-4 space-y-1 border-l-2 border-gray-100 pl-3">
                          {category.subcategories.map((subcategory) => (
                            <Link
                              key={subcategory.id}
                              to={`/products?category=${subcategory.slug}`}
                              className={`block py-2 px-2 rounded-md text-sm ${
                                location.search.includes(`category=${subcategory.slug}`)
                                  ? 'text-primary font-semibold bg-primary-50'
                                  : 'text-gray-600'
                              } hover:text-primary hover:bg-primary-50 transition-colors`}
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {subcategory.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="px-4 pt-4 space-y-2 border-t">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/account"
                    className="block py-2 px-2 rounded-md text-gray-700 hover:text-primary hover:bg-primary-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    👤 Account
                  </Link>
                  <Link
                    to="/orders"
                    className="block py-2 px-2 rounded-md text-gray-700 hover:text-primary hover:bg-primary-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    📦 Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left py-2 px-2 rounded-md text-gray-700 hover:text-primary hover:bg-primary-50 transition-colors"
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block py-2 px-2 rounded-md text-gray-700 hover:text-primary hover:bg-primary-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block py-2 px-2 rounded-md text-gray-700 hover:text-primary hover:bg-primary-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}

              <Link
                to="/wishlist"
                className="block py-2 px-2 rounded-md text-gray-700 hover:text-primary hover:bg-primary-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                ❤️ Wishlist ({wishlistCount})
              </Link>

              <Link
                to="/cart"
                className="block py-2 px-2 rounded-md text-gray-700 hover:text-primary hover:bg-primary-50 transition-colors"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsCartOpen(true);
                }}
              >
                Cart ({cartCount})
              </Link>
            </div>
          </nav>
        </div>
      </div>
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        continueShopping={handleContinueShopping}
      />
    </header>
  );
}
