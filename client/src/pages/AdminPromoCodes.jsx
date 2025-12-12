import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Plus, Edit, Trash2, Percent, DollarSign, Calendar, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

const AdminPromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    min_order_amount: '',
    max_uses: '',
    start_date: '',
    end_date: '',
    is_active: true
  });
  const [editingCode, setEditingCode] = useState(null);

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getPromoCodes();
      setPromoCodes(response.promoCodes);
    } catch (error) {
      console.error('Failed to fetch promo codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createPromoCode(formData);
      setShowForm(false);
      setFormData({
        code: '',
        type: 'percentage',
        value: '',
        min_order_amount: '',
        max_uses: '',
        start_date: '',
        end_date: '',
        is_active: true
      });
      fetchPromoCodes();
    } catch (error) {
      console.error('Failed to create promo code:', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updatePromoCode(editingCode.id, formData);
      setEditingCode(null);
      setFormData({
        code: '',
        type: 'percentage',
        value: '',
        min_order_amount: '',
        max_uses: '',
        start_date: '',
        end_date: '',
        is_active: true
      });
      fetchPromoCodes();
    } catch (error) {
      console.error('Failed to update promo code:', error);
    }
  };

  const handleDelete = async (promoCodeId) => {
    if (confirm('Are you sure you want to delete this promo code?')) {
      try {
        await adminApi.deletePromoCode(promoCodeId);
        fetchPromoCodes();
      } catch (error) {
        console.error('Failed to delete promo code:', error);
      }
    }
  };

  const handleEdit = (promoCode) => {
    setEditingCode(promoCode);
    setFormData({
      code: promoCode.code,
      type: promoCode.type,
      value: promoCode.value,
      min_order_amount: promoCode.min_order_amount,
      max_uses: promoCode.max_uses,
      start_date: promoCode.start_date,
      end_date: promoCode.end_date,
      is_active: promoCode.is_active
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Promo Code Management</h1>
              <p className="text-gray-600 mt-1">Manage discount codes and promotions</p>
            </div>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Promo Code
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Promo Code</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                      placeholder="e.g., WELCOME10"
                      required
                      maxLength={20}
                    />
                    <p className="text-xs text-gray-500 mt-1">Uppercase letters and numbers only</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                      {formData.type === 'percentage' ? (
                        <div className="relative">
                          <Input
                            type="number"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: Math.min(100, Math.max(0, parseInt(e.target.value || '0'))) })}
                            placeholder="10"
                            min="0"
                            max="100"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            type="number"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: Math.max(0, parseFloat(e.target.value || '0')) })}
                            placeholder="10.00"
                            min="0"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount</label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={formData.min_order_amount}
                          onChange={(e) => setFormData({ ...formData, min_order_amount: Math.max(0, parseFloat(e.target.value || '0')) })}
                          placeholder="50.00"
                          min="0"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                      <Input
                        type="number"
                        value={formData.max_uses}
                        onChange={(e) => setFormData({ ...formData, max_uses: Math.max(0, parseInt(e.target.value || '0')) })}
                        placeholder="100"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <Input
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <Input
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Create Promo Code</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Promo Codes List */}
        <Card>
          <CardHeader>
            <CardTitle>All Promo Codes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {promoCodes.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No promo codes found. Create your first promo code!
                  </div>
                ) : (
                  promoCodes.map((promoCode) => (
                    <div key={promoCode.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {promoCode.type === 'percentage' ? (
                            <Percent className="h-5 w-5 text-green-600" />
                          ) : (
                            <DollarSign className="h-5 w-5 text-blue-600" />
                          )}
                          <div>
                            <div className="font-medium text-lg">{promoCode.code}</div>
                            <div className="text-sm text-gray-500">
                              {promoCode.type === 'percentage' ? `${promoCode.value}% off` : `$${promoCode.value} off`}
                              {promoCode.min_order_amount > 0 && ` • Min $${promoCode.min_order_amount}`}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Uses</div>
                          <div className="font-medium">{promoCode.current_uses}/{promoCode.max_uses}</div>
                        </div>
                        <Badge variant={promoCode.is_active ? "success" : "secondary"}>
                          {promoCode.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Valid Until</div>
                          <div className="font-medium">
                            {new Date(promoCode.end_date).toLocaleDateString('en-US')}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(promoCode)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(promoCode.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Promo Code Modal */}
        {editingCode && (
          <Dialog open={editingCode !== null} onOpenChange={() => setEditingCode(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Promo Code: {editingCode.code}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                    placeholder="e.g., WELCOME10"
                    required
                    maxLength={20}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                    {formData.type === 'percentage' ? (
                      <div className="relative">
                        <Input
                          type="number"
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: Math.min(100, Math.max(0, parseInt(e.target.value || '0'))) })}
                          placeholder="10"
                          min="0"
                          max="100"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <Input
                          type="number"
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: Math.max(0, parseFloat(e.target.value || '0')) })}
                          placeholder="10.00"
                          min="0"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount</label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.min_order_amount}
                        onChange={(e) => setFormData({ ...formData, min_order_amount: Math.max(0, parseFloat(e.target.value || '0')) })}
                        placeholder="50.00"
                        min="0"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                    <Input
                      type="number"
                      value={formData.max_uses}
                      onChange={(e) => setFormData({ ...formData, max_uses: Math.max(0, parseInt(e.target.value || '0')) })}
                      placeholder="100"
                      min="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <Input
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <Input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditingCode(null)}>Cancel</Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Update Promo Code</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default AdminPromoCodes;