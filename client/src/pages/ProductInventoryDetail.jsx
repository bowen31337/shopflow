import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../api/admin';
import { ArrowLeft, Box, TrendingDown, AlertTriangle, DollarSign, Calendar, Package } from 'lucide-react';

const ProductInventoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockQuantity, setStockQuantity] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');

  useEffect(() => {
    fetchProductInventory();
  }, [id]);

  const fetchProductInventory = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getProductInventory(id);
      setProduct(response.product);
      setRecentOrders(response.recentOrders);
      setStockHistory(response.stockHistory);
      setStockQuantity(response.product.stock_quantity);
      setLowStockThreshold(response.product.low_stock_threshold);
    } catch (error) {
      console.error('Failed to fetch product inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async () => {
    try {
      await adminApi.updateStock(id, {
        stock_quantity: parseInt(stockQuantity),
        low_stock_threshold: parseInt(lowStockThreshold)
      });
      fetchProductInventory();
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  };

  const getStockStatus = (stock, threshold) => {
    if (stock === 0) return { status: 'Out of Stock', color: 'red' };
    if (stock <= threshold) return { status: 'Low Stock', color: 'yellow' };
    return { status: 'In Stock', color: 'green' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h3>
            <p className="text-gray-600">The product you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const status = getStockStatus(product.stock_quantity, product.low_stock_threshold);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/inventory')}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={20} />
            Back to Inventory
          </button>
          <div className="mt-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-600">SKU: {product.sku} • {product.category_name} • {product.brand_name}</p>
            </div>
            <div className="flex items-center gap-4">
              {status.color === 'red' && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full font-semibold">
                  <AlertTriangle size={18} />
                  {status.status}
                </span>
              )}
              {status.color === 'yellow' && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full font-semibold">
                  <TrendingDown size={18} />
                  {status.status}
                </span>
              )}
              {status.color === 'green' && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold">
                  <Box size={18} />
                  {status.status}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Info & Stock Management */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <p className="text-gray-900">{product.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                  <p className="text-gray-900">{product.sku}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <p className="text-gray-900">{product.category_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <p className="text-gray-900">{product.brand_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <p className="text-gray-900">${product.price}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <p className="text-gray-900">{product.is_active ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-gray-900">{product.description}</p>
                </div>
              </div>
            </div>

            {/* Stock Management */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Stock Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Stock</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={handleStockUpdate}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
                >
                  <Package size={20} />
                  Update Stock
                </button>
                <div className="text-sm text-gray-600">
                  Last updated: {new Date(product.updated_at).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
              {recentOrders.length === 0 ? (
                <p className="text-gray-600">No recent orders for this product.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Order Number</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Quantity</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Price</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr key={order.order_number} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">{order.order_number}</td>
                          <td className="py-3 px-4 text-gray-900">{order.quantity}</td>
                          <td className="py-3 px-4 text-gray-900">${order.unit_price}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : order.status === 'processing'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-900">{new Date(order.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Stock History & Summary */}
          <div className="space-y-8">
            {/* Stock Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Stock Summary</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Stock</span>
                  <span className="font-semibold text-gray-900">{product.stock_quantity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Low Stock Threshold</span>
                  <span className="font-semibold text-gray-900">{product.low_stock_threshold}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-semibold text-gray-900">${product.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    status.color === 'red'
                      ? 'bg-red-100 text-red-700'
                      : status.color === 'yellow'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {status.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="text-sm text-gray-900">{new Date(product.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Stock Movement History */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Stock Movement History</h2>
              {stockHistory.length === 0 ? (
                <p className="text-gray-600">No stock movement history available.</p>
              ) : (
                <div className="space-y-4">
                  {stockHistory.map((movement, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          {movement.type === 'Order' ? <Box size={16} /> : <Calendar size={16} />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{movement.type}</p>
                          <p className="text-sm text-gray-600">{movement.reference}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{movement.change}</p>
                        <p className="text-sm text-gray-600">{new Date(movement.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInventoryDetail;