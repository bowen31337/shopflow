import React, { useState, useEffect } from 'react';

const PriceRangeSlider = ({ minPrice, maxPrice, onMinChange, onMaxChange, minLimit = 0, maxLimit = 1000 }) => {
  const [localMin, setLocalMin] = useState(minPrice || minLimit);
  const [localMax, setLocalMax] = useState(maxPrice || maxLimit);

  // Sync with external values
  useEffect(() => {
    setLocalMin(minPrice || minLimit);
  }, [minPrice, minLimit]);

  useEffect(() => {
    setLocalMax(maxPrice || maxLimit);
  }, [maxPrice, maxLimit]);

  const handleMinChange = (value) => {
    const newMin = Math.min(parseInt(value), localMax);
    setLocalMin(newMin);
    onMinChange(newMin);
  };

  const handleMaxChange = (value) => {
    const newMax = Math.max(parseInt(value), localMin);
    setLocalMax(newMax);
    onMaxChange(newMax);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="mb-6">
      <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>

      <div className="space-y-4">
        {/* Price Labels */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>Min: {formatPrice(localMin)}</span>
          <span>Max: {formatPrice(localMax)}</span>
        </div>

        {/* Min Price Slider */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">Minimum Price</label>
          <input
            type="range"
            min={minLimit}
            max={maxLimit}
            step="10"
            value={localMin}
            onChange={(e) => handleMinChange(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            aria-label="Minimum price slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatPrice(minLimit)}</span>
            <span>{formatPrice(maxLimit)}</span>
          </div>
        </div>

        {/* Max Price Slider */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">Maximum Price</label>
          <input
            type="range"
            min={minLimit}
            max={maxLimit}
            step="10"
            value={localMax}
            onChange={(e) => handleMaxChange(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            aria-label="Maximum price slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatPrice(minLimit)}</span>
            <span>{formatPrice(maxLimit)}</span>
          </div>
        </div>

        {/* Price Input Fields */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Min Price</label>
            <input
              type="number"
              min={minLimit}
              max={localMax}
              step="10"
              value={localMin}
              onChange={(e) => handleMinChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Minimum price input"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Max Price</label>
            <input
              type="number"
              min={localMin}
              max={maxLimit}
              step="10"
              value={localMax}
              onChange={(e) => handleMaxChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Maximum price input"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #10B981;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #10B981;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
        }

        .slider::-webkit-slider-runnable-track {
          height: 6px;
          background: linear-gradient(90deg, #10B981, #9CA3AF);
          border-radius: 999px;
        }

        .slider::-moz-range-track {
          height: 6px;
          background: linear-gradient(90deg, #10B981, #9CA3AF);
          border-radius: 999px;
        }
      `}</style>
    </div>
  );
};

export default PriceRangeSlider;