import { useState, useEffect } from 'react';
import api from '../api';
import AddressForm from './AddressForm';

export default function AddressBook() {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/user/addresses');
      setAddresses(response.data.addresses);
      setError('');
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setError('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowForm(true);
    setSuccess('');
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowForm(true);
    setSuccess('');
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await api.delete(`/api/user/addresses/${addressId}`);
      setAddresses(addresses.filter(addr => addr.id !== addressId));
      setSuccess('Address deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting address:', error);
      setError('Failed to delete address');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const response = await api.put(`/api/user/addresses/${addressId}`, {
        ...addresses.find(addr => addr.id === addressId),
        isDefault: true
      });

      // Update addresses list
      setAddresses(addresses.map(addr =>
        addr.id === addressId
          ? { ...addr, is_default: 1 }
          : { ...addr, is_default: 0 }
      ));

      setSuccess('Default address updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error setting default address:', error);
      setError('Failed to set default address');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleFormSuccess = (message) => {
    setSuccess(message);
    setShowForm(false);
    setEditingAddress(null);
    fetchAddresses(); // Refresh addresses
    setTimeout(() => setSuccess(''), 3000);
  };

  if (showForm) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h2>
            <button
              onClick={handleFormClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <AddressForm
            address={editingAddress}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Address Book</h2>
          <button
            onClick={handleAddAddress}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Address</span>
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved addresses</h3>
            <p className="text-gray-600 mb-4">Add your first address to make checkout faster</p>
            <button
              onClick={handleAddAddress}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`border rounded-lg p-4 relative ${
                  address.is_default ? 'border-primary bg-green-50' : 'border-gray-200'
                }`}
              >
                {address.is_default && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                      Default
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="font-medium text-gray-900">{address.label}</h3>
                  <p className="text-gray-600">
                    {address.first_name} {address.last_name}
                  </p>
                  <p className="text-gray-600">{address.street_address}</p>
                  {address.apartment && (
                    <p className="text-gray-600">{address.apartment}</p>
                  )}
                  <p className="text-gray-600">
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                  <p className="text-gray-600">{address.country}</p>
                  <p className="text-gray-600">{address.phone}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!address.is_default && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-sm text-primary hover:text-green-600 font-medium"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}