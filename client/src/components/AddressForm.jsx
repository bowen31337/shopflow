import { useState, useEffect, useRef } from 'react';
import api from '../api';

export default function AddressForm({ address, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    label: 'Home',
    firstName: '',
    lastName: '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: '',
    isDefault: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Address autocomplete state
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const streetAddressInputRef = useRef(null);

  useEffect(() => {
    if (address) {
      setFormData({
        label: address.label || 'Home',
        firstName: address.first_name || '',
        lastName: address.last_name || '',
        streetAddress: address.street_address || '',
        apartment: address.apartment || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postal_code || '',
        country: address.country || 'United States',
        phone: address.phone || '',
        isDefault: !!address.is_default
      });
    }
  }, [address]);

  // Handle clicks outside suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          streetAddressInputRef.current && !streetAddressInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch address suggestions
  const fetchAddressSuggestions = async (query) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsFetchingSuggestions(true);
    try {
      const response = await api.get(`/api/checkout/address-autocomplete?query=${encodeURIComponent(query)}`);
      if (response.success) {
        setAddressSuggestions(response.suggestions || []);
        setShowSuggestions((response.suggestions || []).length > 0);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setAddressSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  // Handle street address input change with debouncing
  const handleStreetAddressChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      streetAddress: value
    }));

    // Clear error for this field when user starts typing
    if (errors.streetAddress) {
      setErrors(prev => ({
        ...prev,
        streetAddress: ''
      }));
    }

    // Fetch suggestions after a delay (debouncing)
    if (value.trim().length >= 3) {
      const timer = setTimeout(() => {
        fetchAddressSuggestions(value);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle address suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      streetAddress: suggestion.street_address,
      city: suggestion.city,
      state: suggestion.state,
      postalCode: suggestion.postal_code,
      country: suggestion.country
    }));
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special handling for street address to trigger autocomplete
    if (name === 'streetAddress') {
      handleStreetAddressChange(e);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.label.trim()) newErrors.label = 'Label is required';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';

    // Postal code validation
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else {
      // US ZIP code validation (5 digits or 5-4 format)
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(formData.postalCode)) {
        newErrors.postalCode = 'Invalid postal code format (use 12345 or 12345-6789)';
      }
    }

    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (address) {
        // Update existing address
        const response = await api.put(`/api/user/addresses/${address.id}`, formData);
        onSuccess(response.message || 'Address updated successfully');
      } else {
        // Add new address
        const response = await api.post('/api/user/addresses', formData);
        onSuccess(response.message || 'Address added successfully');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      if (error.response?.data?.error) {
        setErrors({ submit: error.response.data.error });
      } else if (error.message) {
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: 'Failed to save address. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const labelOptions = ['Home', 'Work', 'Other'];
  const stateOptions = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address Label *
          </label>
          <select
            name="label"
            value={formData.label}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.label ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            {labelOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.label && (
            <p className="text-red-500 text-sm mt-1">{errors.label}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="(555) 123-4567"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Street Address *
        </label>
        <div className="relative">
          <input
            ref={streetAddressInputRef}
            type="text"
            name="streetAddress"
            value={formData.streetAddress}
            onChange={handleInputChange}
            onFocus={() => {
              if (formData.streetAddress.length >= 3 && addressSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder="123 Main St"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.streetAddress ? 'border-red-500' : 'border-gray-300'
            }`}
            required
            autoComplete="off"
          />
          {isFetchingSuggestions && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
            </div>
          )}
        </div>
        {errors.streetAddress && (
          <p className="text-red-500 text-sm mt-1">{errors.streetAddress}</p>
        )}

        {/* Address Suggestions Dropdown */}
        {showSuggestions && addressSuggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <div className="py-1">
              {addressSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
                >
                  <div className="font-medium text-gray-900">{suggestion.street_address}</div>
                  <div className="text-sm text-gray-600">
                    {suggestion.city}, {suggestion.state} {suggestion.postal_code}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Apartment, Suite, etc. (optional)
        </label>
        <input
          type="text"
          name="apartment"
          value={formData.apartment}
          onChange={handleInputChange}
          placeholder="Apt 4B, Suite 100"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="New York"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State *
          </label>
          <select
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.state ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select State</option>
            {stateOptions.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {errors.state && (
            <p className="text-red-500 text-sm mt-1">{errors.state}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ZIP Code *
          </label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleInputChange}
            placeholder="10001"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.postalCode ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.postalCode && (
            <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Country *
        </label>
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.country ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {errors.country && (
          <p className="text-red-500 text-sm mt-1">{errors.country}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isDefault"
          id="isDefault"
          checked={formData.isDefault}
          onChange={handleInputChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
          Set as default address
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : (address ? 'Update Address' : 'Add Address')}
        </button>
      </div>
    </form>
  );
}