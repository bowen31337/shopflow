import { useEffect } from 'react';

const SearchHistory = ({ isVisible, history, onSelect, onClose }) => {
  // Handle clicks outside to close search history
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If clicking outside and search history is visible, close it
      if (isVisible && !event.target.closest('.search-history-container')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose]);

  if (!isVisible || history.length === 0) {
    return null;
  }

  return (
    <div className="search-history-container absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-50">
      <div className="py-2">
        <div className="px-4 py-2 text-sm text-gray-600 border-b">
          Recent Searches
        </div>
        {history.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelect(item)}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
          >
            <span className="text-gray-400">🔍</span>
            <span className="text-gray-700">{item}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchHistory;