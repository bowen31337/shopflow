import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/admin';

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCustomRange, setIsCustomRange] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const params = {};

        if (isCustomRange && startDate && endDate) {
          params.startDate = startDate;
          params.endDate = endDate;
        } else {
          params.period = period;
        }

        const data = await adminApi.getAnalytics(params);
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period, startDate, endDate, isCustomRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="space-y-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg p-6 shadow">
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
                  <div className="h-64 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-2xl font-bold text-gray-600 mb-4">No Analytics Data</div>
            <p className="text-gray-500">No sales data available for the selected period.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>
            <p className="text-gray-600">Track your store performance and sales metrics</p>
          </div>

          {/* Date Range Controls */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-500">📅</span>

            {/* Preset Period Selector */}
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                setIsCustomRange(false);
                setStartDate('');
                setEndDate('');
              }}
              disabled={isCustomRange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last 365 Days</option>
            </select>

            {/* Custom Date Range Toggle */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isCustomRange}
                onChange={(e) => {
                  setIsCustomRange(e.target.checked);
                  if (!e.target.checked) {
                    setStartDate('');
                    setEndDate('');
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Custom Range</span>
            </label>

            {/* Start Date */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={!isCustomRange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              max={endDate || undefined}
            />

            {/* End Date */}
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={!isCustomRange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              min={startDate || undefined}
            />

            {/* View Button */}
            <button
              onClick={() => {
                // The useEffect will automatically trigger when state changes
              }}
              disabled={!isCustomRange || !startDate || !endDate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              View
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Total Revenue</div>
                <div className="text-2xl font-bold mt-2">{formatCurrency(analytics.totals.totalRevenue)}</div>
                <div className="text-xs text-gray-500 mt-1">For {analytics.period}</div>
              </div>
              <span className="text-green-600">💰</span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Total Orders</div>
                <div className="text-2xl font-bold mt-2">{analytics.totals.totalOrders}</div>
                <div className="text-xs text-gray-500 mt-1">Completed orders</div>
              </div>
              <span className="text-blue-600">📈</span>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Avg Order Value</div>
                <div className="text-2xl font-bold mt-2">{formatCurrency(analytics.totals.avgOrderValue)}</div>
                <div className="text-xs text-gray-500 mt-1">Per order</div>
              </div>
              <span className="text-purple-600">👥</span>
            </div>
          </div>

          {/* Date Range */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Period</div>
                {analytics.startDate && analytics.endDate ? (
                  <div className="text-2xl font-bold mt-2">
                    {analytics.startDate} to {analytics.endDate}
                  </div>
                ) : (
                  <div className="text-2xl font-bold mt-2 capitalize">{analytics.period}</div>
                )}
                <div className="text-xs text-gray-500 mt-1">Customizable range</div>
              </div>
              <span className="text-orange-600">📊</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue by Day Chart */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold mb-4">Revenue by Day</h2>
            <div className="space-y-3">
              {analytics.revenueByDay.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{formatDate(day.date)}</div>
                    <div className="text-sm text-gray-500">{day.orders} orders</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(day.revenue)}</div>
                    <div className="text-sm text-green-600">+{day.orders} orders</div>
                  </div>
                </div>
              ))}
              {analytics.revenueByDay.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No revenue data for this period
                </div>
              )}
            </div>
          </div>

          {/* Sales by Category */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold mb-4">Sales by Category</h2>
            <div className="space-y-3">
              {analytics.salesByCategory.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{category.category}</div>
                    <div className="text-sm text-gray-500">{category.units_sold} units sold</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(category.revenue)}</div>
                    <div className="text-xs text-gray-500">{category.units_sold} units</div>
                  </div>
                </div>
              ))}
              {analytics.salesByCategory.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No category data for this period
                </div>
              )}
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-white rounded-lg p-6 shadow lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Product</th>
                    <th className="text-left py-2 px-4 font-medium">Units Sold</th>
                    <th className="text-left py-2 px-4 font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topProducts.map((product, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {product.image && (
                            <img src={product.image} alt={product.product} className="w-12 h-12 rounded object-cover" />
                          )}
                          <div>
                            <div className="font-medium">{product.product}</div>
                            <div className="text-sm text-gray-500">{product.units_sold} sold</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{product.units_sold}</td>
                      <td className="py-3 px-4">{formatCurrency(product.revenue)}</td>
                    </tr>
                  ))}
                  {analytics.topProducts.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-gray-500">
                        No product data for this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;