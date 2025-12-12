import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Plus, Edit, Trash2, Folder } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
    description: '',
    position: 0,
    is_active: true
  });
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createCategory(formData);
      setShowForm(false);
      setFormData({ name: '', parent_id: '', description: '', position: 0, is_active: true });
      fetchCategories();
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateCategory(editingCategory.id, formData);
      setEditingCategory(null);
      setFormData({ name: '', parent_id: '', description: '', position: 0, is_active: true });
      fetchCategories();
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleDelete = async (categoryId) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await adminApi.deleteCategory(categoryId);
        fetchCategories();
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      parent_id: category.parent_id || '',
      description: category.description || '',
      position: category.position || 0,
      is_active: category.is_active
    });
  };

  const parentCategories = categories.filter(cat => !cat.parent_id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
              <p className="text-gray-600 mt-1">Manage product categories and subcategories</p>
            </div>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Category</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                    <select
                      value={formData.parent_id}
                      onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">None (Main Category)</option>
                      {parentCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter category description"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <Input
                        type="number"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex-1">
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
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Create Category</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Categories List */}
        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
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
                {categories.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No categories found. Create your first category!
                  </div>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Folder className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-gray-500">
                            {category.parent_id ? `Subcategory of ${parentCategories.find(p => p.id === category.parent_id)?.name}` : 'Main Category'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={category.is_active ? "success" : "secondary"}>
                          {category.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-sm text-gray-500">Position: {category.position}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
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

        {/* Edit Category Modal */}
        {editingCategory && (
          <Dialog open={editingCategory !== null} onOpenChange={() => setEditingCategory(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Category: {editingCategory.name}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">None (Main Category)</option>
                    {parentCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter category description"
                  />
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <Input
                      type="number"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
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
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>Cancel</Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Update Category</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;