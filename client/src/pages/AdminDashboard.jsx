import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/admin';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await adminApi.getMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg p-6 shadow">
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/admin/products')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md"
              >
                Manage Products
              </button>
              <button
                onClick={() => navigate('/admin/orders')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                View Orders
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Total Revenue</div>
                <div className="text-2xl font-bold mt-2">${metrics?.totalRevenue?.toFixed(2) || '0.00'}</div>
                <div className="text-xs text-gray-500 mt-1">All-time sales</div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Total Orders</div>
                <div className="text-2xl font-bold mt-2">{metrics?.totalOrders || 0}</div>
                <div className="text-xs text-gray-500 mt-1">Completed orders</div>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Total Customers */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Total Customers</div>
                <div className="text-2xl font-bold mt-2">{metrics?.totalCustomers || 0}</div>
                <div className="text-xs text-gray-500 mt-1">Registered users</div>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Avg Order Value</div>
                <div className="text-2xl font-bold mt-2">${metrics?.avgOrderValue?.toFixed(2) || '0.00'}</div>
                <div className="text-xs text-gray-500 mt-1">Per order</div>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              <button
                onClick={() => navigate('/admin/orders')}
                className="text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {metrics?.recentOrders?.length > 0 ? (
                metrics.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Order #{order.order_number}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-US')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(order.total)}</div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No recent orders
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => navigate('/admin/products')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md text-left"
              >
                <div className="font-medium">Manage Products</div>
                <div className="text-sm opacity-90">Add, edit, and manage your product catalog</div>
              </button>
              <button
                onClick={() => navigate('/admin/orders')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md text-left"
              >
                <div className="font-medium">View Orders</div>
                <div className="text-sm opacity-90">Manage and track all customer orders</div>
              </button>
              <button
                onClick={() => navigate('/admin/customers')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md text-left"
              >
                <div className="font-medium">Manage Customers</div>
                <div className="text-sm opacity-90">View and manage customer information</div>
              </button>
              <button
                onClick={() => navigate('/admin/categories')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-md text-left"
              >
                <div className="font-medium">Manage Categories</div>
                <div className="text-sm opacity-90">Organize your product categories</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;