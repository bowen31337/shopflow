import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../stores/cartStore';
import useAuthStore from '../stores/authStore';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice } = useCartStore();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState({
    shippingAddress: null,
    shippingMethod: null,
    paymentMethod: null,
    notes: ''
  });

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const steps = [
    { id: 1, name: 'Shipping', description: 'Shipping address' },
    { id: 2, name: 'Shipping', description: 'Shipping method' },
    { id: 3, name: 'Payment', description: 'Payment details' },
    { id: 4, name: 'Review', description: 'Review order' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddressSelect = (address) => {
    setOrderData(prev => ({ ...prev, shippingAddress: address }));
    handleNext();
  };

  const handleShippingMethodSelect = (method) => {
    setOrderData(prev => ({ ...prev, shippingMethod: method }));
    handleNext();
  };

  const calculateShipping = () => {
    if (!orderData.shippingMethod) return 0;
    return orderData.shippingMethod.cost || 0;
  };

  const calculateTax = () => {
    const subtotal = getTotalPrice();
    return subtotal * 0.08; // 8% tax rate
  };

  const calculateTotal = () => {
    const subtotal = getTotalPrice();
    const shipping = calculateShipping();
    const tax = calculateTax();
    return subtotal + shipping + tax;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart before checking out</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-md hover:bg-emerald-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Stepper */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol role="list" className="flex items-center justify-center">
              {steps.map((step, stepIdx) => (
                <li
                  key={step.id}
                  className={`
                    ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}
                    flex items-center
                  `}
                >
                  <div className="flex items-center">
                    <div
                      className={`
                        w-10 h-10 flex items-center justify-center rounded-full
                        ${currentStep > step.id
                          ? 'bg-emerald-600 text-white'
                          : currentStep === step.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-300 text-gray-500'
                        }
                      `}
                    >
                      {currentStep > step.id ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="ml-4">
                      <p className={`text-sm font-medium ${
                        currentStep > step.id ? 'text-emerald-600' :
                        currentStep === step.id ? 'text-emerald-600' :
                        'text-gray-500'
                      }`}>
                        Step {step.id}
                      </p>
                      <p className="text-sm text-gray-900">{step.description}</p>
                    </div>
                  </div>
                  {stepIdx !== steps.length - 1 && (
                    <div
                      className={`
                        flex-1 h-px mx-4
                        ${currentStep > step.id + 1 ? 'bg-emerald-600' : 'bg-gray-300'}
                      `}
                    />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && <ShippingAddressStep onAddressSelect={handleAddressSelect} />}
            {currentStep === 2 && <ShippingMethodStep onMethodSelect={handleShippingMethodSelect} />}
            {currentStep === 3 && <PaymentStep onPaymentSelect={(method) => {
              setOrderData(prev => ({ ...prev, paymentMethod: method }));
              handleNext();
            }} />}
            {currentStep === 4 && <ReviewStep orderData={orderData} onPlaceOrder={() => {
              // Handle order placement
              console.log('Placing order:', orderData);
              // Navigate to order confirmation
              navigate('/profile');
            }} />}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              {currentStep < 4 && (
                <button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !orderData.shippingAddress) ||
                    (currentStep === 2 && !orderData.shippingMethod) ||
                    (currentStep === 3 && !orderData.paymentMethod)
                  }
                  className={`px-6 py-3 rounded-md font-medium transition-colors ${
                    currentStep === 1 && !orderData.shippingAddress ||
                    currentStep === 2 && !orderData.shippingMethod ||
                    currentStep === 3 && !orderData.paymentMethod
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  Next
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.image || '/placeholder-product.jpg'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {orderData.shippingMethod ? `$${calculateShipping().toFixed(2)}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${calculateTax().toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-base font-semibold text-gray-900">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Shipping Address Step Component
const ShippingAddressStep = ({ onAddressSelect }) => {
  const authStore = useAuthStore();
  const user = authStore.user;
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch('/api/user/addresses', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setAddresses(data);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Address</h2>

      {addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className="border rounded-lg p-4 cursor-pointer hover:border-emerald-500 transition-colors">
              <label className="flex items-start cursor-pointer">
                <input
                  type="radio"
                  name="address"
                  value={address.id}
                  checked={selectedAddress?.id === address.id}
                  onChange={(e) => {
                    const selected = addresses.find(a => a.id === parseInt(e.target.value));
                    setSelectedAddress(selected);
                  }}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {address.first_name} {address.last_name}
                    {address.is_default && <span className="ml-2 text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Default</span>}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {address.street_address}
                    {address.apartment && `, ${address.apartment}`}
                    <br />
                    {address.city}, {address.state} {address.postal_code}
                    <br />
                    {address.country}
                  </div>
                  {address.phone && (
                    <div className="text-sm text-gray-600 mt-1">{address.phone}</div>
                  )}
                </div>
              </label>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No shipping addresses found</p>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors">
            Add New Address
          </button>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => selectedAddress && onAddressSelect(selectedAddress)}
          disabled={!selectedAddress}
          className={`px-6 py-3 rounded-md font-medium transition-colors ${
            selectedAddress
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Shipping Method
        </button>
      </div>
    </div>
  );
};

// Shipping Method Step Component
const ShippingMethodStep = ({ onMethodSelect }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const shippingMethods = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: '5-7 business days',
      cost: 5.99
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: '2-3 business days',
      cost: 12.99
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      description: '1 business day',
      cost: 24.99
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Method</h2>

      <div className="space-y-4">
        {shippingMethods.map((method) => (
          <div key={method.id} className="border rounded-lg p-4 cursor-pointer hover:border-emerald-500 transition-colors">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center">
                <input
                  type="radio"
                  name="shippingMethod"
                  value={method.id}
                  checked={selectedMethod?.id === method.id}
                  onChange={(e) => {
                    const selected = shippingMethods.find(m => m.id === e.target.value);
                    setSelectedMethod(selected);
                  }}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">{method.name}</div>
                  <div className="text-sm text-gray-600">{method.description}</div>
                </div>
              </div>
              <div className="font-medium text-gray-900">${method.cost.toFixed(2)}</div>
            </label>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => selectedMethod && onMethodSelect(selectedMethod)}
          disabled={!selectedMethod}
          className={`px-6 py-3 rounded-md font-medium transition-colors ${
            selectedMethod
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
};

// Payment Step Component
const PaymentStep = ({ onPaymentSelect }) => {
  const [selectedMethod, setSelectedMethod] = useState('card');

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>

      <div className="space-y-4 mb-6">
        <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
          <input
            type="radio"
            name="paymentMethod"
            value="card"
            checked={selectedMethod === 'card'}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="mr-3"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900">Credit/Debit Card</div>
            <div className="text-sm text-gray-600">Visa, Mastercard, American Express</div>
          </div>
        </label>

        <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
          <input
            type="radio"
            name="paymentMethod"
            value="paypal"
            checked={selectedMethod === 'paypal'}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="mr-3"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900">PayPal</div>
            <div className="text-sm text-gray-600">Pay with your PayPal account</div>
          </div>
        </label>
      </div>

      {/* Simple card form (in production, this would use Stripe Elements) */}
      {selectedMethod === 'card' && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Card Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => onPaymentSelect(selectedMethod)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-md font-medium hover:bg-emerald-700 transition-colors"
        >
          Review Order
        </button>
      </div>
    </div>
  );
};

// Review Step Component
const ReviewStep = ({ orderData, onPlaceOrder }) => {
  const cartStore = useCartStore();
  const items = cartStore.items;
  const getTotalPrice = cartStore.getTotalPrice;
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const calculateTotal = () => {
    const subtotal = getTotalPrice();
    const shipping = orderData.shippingMethod?.cost || 0;
    const tax = subtotal * 0.08;
    return subtotal + shipping + tax;
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      // Simulate order placement
      await new Promise(resolve => setTimeout(resolve, 2000));
      onPlaceOrder();
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Order</h2>

      {/* Shipping Address */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Shipping Address</h3>
        {orderData.shippingAddress && (
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="font-medium">
              {orderData.shippingAddress.first_name} {orderData.shippingAddress.last_name}
            </p>
            <p className="text-gray-600">
              {orderData.shippingAddress.street_address}
              {orderData.shippingAddress.apartment && `, ${orderData.shippingAddress.apartment}`}
            </p>
            <p className="text-gray-600">
              {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.postal_code}
            </p>
            <p className="text-gray-600">{orderData.shippingAddress.country}</p>
            {orderData.shippingAddress.phone && (
              <p className="text-gray-600">{orderData.shippingAddress.phone}</p>
            )}
          </div>
        )}
      </div>

      {/* Shipping Method */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Shipping Method</h3>
        {orderData.shippingMethod && (
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="font-medium">{orderData.shippingMethod.name}</p>
            <p className="text-gray-600">{orderData.shippingMethod.description}</p>
            <p className="text-gray-900">${orderData.shippingMethod.cost.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Method</h3>
        {orderData.paymentMethod && (
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="font-medium">
              {orderData.paymentMethod === 'card' ? 'Credit/Debit Card' : 'PayPal'}
            </p>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Order Items</h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between py-2 border-b">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Place Order Button */}
      <div className="flex justify-end">
        <button
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder}
          className={`px-8 py-3 rounded-md font-medium transition-colors ${
            isPlacingOrder
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default Checkout;