import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const Autocomplete = ({ isVisible, query, onNavigate }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.trim().length === 0) {
        setSuggestions([]);
        setSelectedIndex(-1);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();
        setSuggestions(data.products || []);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const navigateToProduct = useCallback((product) => {
    setSuggestions([]);
    setSelectedIndex(-1);
    onNavigate?.();
    navigate(`/products/${product.slug}`);
  }, [navigate, onNavigate]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isVisible || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : 0);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : suggestions.length - 1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            navigateToProduct(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          setSuggestions([]);
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, suggestions, selectedIndex, navigateToProduct]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-50">
      <div className="py-2">
        {suggestions.map((product, index) => (
          <button
            key={product.id}
            onClick={() => navigateToProduct(product)}
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 ${
              index === selectedIndex ? 'bg-gray-100' : ''
            }`}
          >
            <img
              src={product.primary_image}
              alt={product.name}
              className="w-8 h-8 object-cover rounded"
              onError={(e) => {
                e.target.src = 'https://picsum.photos/seed/placeholder/400/400';
              }}
            />
            <div className="text-left">
              <div className="font-medium text-gray-900">{product.name}</div>
              <div className="text-sm text-gray-600">${product.price.toFixed(2)}</div>
            </div>
          </button>
        ))}
      </div>
      {isLoading && (
        <div className="px-4 py-2 text-sm text-gray-600 border-t">
          Searching...
        </div>
      )}
    </div>
  );
};

export default Autocomplete;