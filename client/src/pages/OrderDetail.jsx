import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useCartStore from '../stores/cartStore';
import api from '../api';

export default function OrderDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const { reorderItems } = useCartStore();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated() && id) {
      fetchOrderDetails();
    }
  }, [isAuthenticated(), id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/api/orders/${id}`);
      setOrder(response.data.order);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(error.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    const statusDescriptions = {
      pending: 'Order received, awaiting processing',
      processing: 'Order is being prepared',
      shipped: 'Order has been shipped',
      delivered: 'Order has been delivered',
      cancelled: 'Order has been cancelled'
    };

    return (
      <div>
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        <p className="text-sm text-gray-600 mt-1">{statusDescriptions[status]}</p>
      </div>
    );
  };

  const getStatusTimeline = (status) => {
    const timeline = [
      { key: 'pending', label: 'Order Placed', icon: '🛒' },
      { key: 'processing', label: 'Processing', icon: '📦' },
      { key: 'shipped', label: 'Shipped', icon: '🚚' },
      { key: 'delivered', label: 'Delivered', icon: '✅' }
    ];

    const currentIndex = timeline.findIndex(item => item.key === status);

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Progress</h3>
        <div className="flex items-center space-x-4">
          {timeline.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isCancelled = status === 'cancelled';

            // For cancelled orders, show all steps as incomplete but with red styling
            const shouldShowRed = isCancelled || (status === 'cancelled' && index <= currentIndex);

            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  isCancelled ? 'bg-red-100 text-red-600' :
                  isCompleted ? 'bg-green-100 text-green-600' :
                  isCurrent ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <span className="text-sm">
                    {isCancelled ? '❌' : isCompleted ? '✅' : step.icon}
                  </span>
                </div>
                {index < timeline.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    isCompleted ? 'bg-green-300' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          {timeline.map((step) => (
            <span key={step.key}>{step.label}</span>
          ))}
        </div>
        {status === 'cancelled' && (
          <div className="text-xs text-red-600 font-medium">
            This order has been cancelled and will not be delivered.
          </div>
        )}
      </div>
    );
  };

  const getEstimatedDelivery = (status, createdAt) => {
    if (status === 'cancelled' || status === 'delivered') {
      return null;
    }

    // Calculate estimated delivery date based on order age
    const createdDate = new Date(createdAt);
    const daysToAdd = status === 'pending' ? 7 : status === 'processing' ? 5 : 3;
    const estimatedDate = new Date(createdDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    return estimatedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await api.post(`/api/orders/${id}/cancel`);
      // Refresh order details
      fetchOrderDetails();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleReorder = async () => {
    if (!window.confirm('Add all items from this order to your cart?')) {
      return;
    }

    try {
      await reorderItems(id);
      alert('Items added to cart successfully!');
      navigate('/cart');
    } catch (error) {
      alert(error.message || 'Failed to reorder items');
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      // Open a new tab/window to trigger PDF download
      window.open(`/api/orders/${id}/invoice`, '_blank');
    } catch (error) {
      alert('Failed to download invoice. Please try again.');
    }
  };

  if (!isAuthenticated()) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view order details.</p>
          <Link
            to="/login"
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
          >
            Login to View Order
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
        <Link
          to="/orders"
          className="text-primary hover:text-green-600 font-medium"
        >
          ← Back to Order History
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link
            to="/orders"
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
          >
            Back to Order History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6 text-sm">
        <Link to="/orders" className="text-primary hover:text-green-600">
          Order History
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <span className="text-gray-900">Order #{order.order_number}</span>
      </nav>

      {/* Order Header */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Order #{order.order_number}
              </h1>
              <p className="text-gray-600">Placed on {order.formatted_date}</p>
              {order.updated_at !== order.created_at && (
                <p className="text-sm text-gray-500">Last updated: {order.formatted_updated_date}</p>
              )}
            </div>
            <div className="text-right">
              {getStatusBadge(order.status)}
              <p className="text-2xl font-bold text-gray-900 mt-2">{order.formatted_total}</p>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="border-t pt-4">
            {getStatusTimeline(order.status)}
          </div>

          {/* Estimated Delivery Date */}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <div className="border-t pt-4 mt-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📅</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Estimated Delivery</h3>
                  <p className="text-gray-600">
                    {getEstimatedDelivery(order.status, order.created_at)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {['pending', 'processing'].includes(order.status) && (
            <div className="flex space-x-3 pt-4 border-t">
              <button
                onClick={handleReorder}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                🔄 Reorder
              </button>
              <button
                onClick={handleCancelOrder}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Cancel Order
              </button>
              <button
                onClick={handleDownloadInvoice}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                📄 Download Invoice
              </button>
            </div>
          )}

          {['delivered', 'cancelled'].includes(order.status) && (
            <div className="flex space-x-3 pt-4 border-t">
              <button
                onClick={handleReorder}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                🔄 Reorder
              </button>
              <button
                onClick={handleDownloadInvoice}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                📄 Download Invoice
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.name}
                      </h3>
                      {item.sku && (
                        <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                      )}
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${item.unit_price.toFixed(2)} each
                      </p>
                      <p className="text-sm text-gray-600">
                        ${item.total_price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary & Details */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{order.formatted_subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{order.formatted_shipping_cost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{order.formatted_tax}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-{order.formatted_discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>{order.formatted_total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Shipping Address</h3>
                  <div className="text-sm text-gray-600">
                    <p>{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                    <p>{order.shipping_address.street_address}</p>
                    {order.shipping_address.apartment && <p>{order.shipping_address.apartment}</p>}
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                    </p>
                    <p>{order.shipping_address.country}</p>
                    {order.shipping_address.phone && <p>{order.shipping_address.phone}</p>}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Shipping Method</h3>
                  <p className="text-sm text-gray-600">{order.shipping_method}</p>
                </div>

                {order.tracking_number && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Tracking Number</h3>
                    <div className="flex items-center space-x-3">
                      <p className="text-sm text-gray-600 font-mono">{order.tracking_number}</p>
                      {order.status === 'shipped' && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                          📦 Shipped
                        </span>
                      )}
                    </div>
                    {order.status === 'shipped' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Track your package with the tracking number above
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium">{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`font-medium ${
                    order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-4">
        <Link
          to="/products"
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
        >
          Continue Shopping
        </Link>
        <Link
          to="/orders"
          className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
        >
          Back to Order History
        </Link>
      </div>
    </div>
  );
}