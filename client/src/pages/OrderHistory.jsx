import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmModal';
import api from '../api';

export default function OrderHistory() {
  const { isAuthenticated } = useAuthStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const isUserAuthenticated = isAuthenticated();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/api/orders?page=${pagination.page}&limit=${pagination.limit}`);
      // API returns data directly, not wrapped in .data
      setOrders(response.orders || []);
      setPagination(prev => ({
        ...prev,
        ...(response.pagination || {})
      }));
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    if (isUserAuthenticated) {
      fetchOrders();
    }
  }, [isUserAuthenticated, fetchOrders]);

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleCancelOrder = async (orderId) => {
    const confirmed = await confirm('Are you sure you want to cancel this order?', {
      title: 'Cancel Order',
      confirmText: 'Yes, Cancel',
      cancelText: 'No, Keep It',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await api.post(`/api/orders/${orderId}/cancel`);
      toast.success('Order cancelled successfully');
      // Refresh the orders list
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (!isAuthenticated()) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view your order history.</p>
          <Link
            to="/login"
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
          >
            Login to View Orders
          </Link>
        </div>
      </div>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        <p className="text-gray-600">View and track your past orders</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {orders.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your order history here.</p>
          <Link
            to="/products"
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow hover:shadow-md transition">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.order_number}
                      </h3>
                      <p className="text-sm text-gray-600">Placed on {order.formatted_date}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                      <p className="text-lg font-bold text-gray-900 mt-1">{order.formatted_total}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={item.id} className="flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg border"
                          />
                          {index === Math.min(2, order.items.length - 1) && order.items.length > 3 && (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center mt-1">
                              <span className="text-sm font-medium text-gray-600">+{order.items.length - 3}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex space-x-3">
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-primary hover:text-green-600 text-sm font-medium transition"
                      >
                        View Details
                      </Link>
                      {['pending', 'processing'].includes(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium transition"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      pageNum === pagination.page
                        ? 'bg-primary text-white'
                        : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}