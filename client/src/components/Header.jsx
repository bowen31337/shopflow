import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
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
            <div className="w-full relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full hover:bg-green-600 transition">
                Search
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
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
              <span className="text-2xl">🛒</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
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
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <nav className="flex flex-col space-y-3">
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
                onClick={() => setIsMenuOpen(false)}
              >
                Cart (0)
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
