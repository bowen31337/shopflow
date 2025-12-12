import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Search, User, Mail, Phone, Calendar, ShoppingCart } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, [pagination.page]);

  useEffect(() => {
    // Reset to first page when search changes
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCustomers(1);
  }, [search]);

  const fetchCustomers = async (page = pagination.page) => {
    setLoading(true);
    try {
      const response = await adminApi.getCustomers({
        page,
        search
      });
      setCustomers(response.customers);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
              <p className="text-gray-600 mt-1">Manage your customers</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers (name, email)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Member Since</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <div>
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-gray-500">{customer.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{customer.email}</span>
                            </div>
                            {customer.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{customer.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {customer.orderCount || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={customer.email_verified ? "success" : "secondary"}>
                            {customer.email_verified ? "Verified" : "Not Verified"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {new Date(customer.created_at).toLocaleDateString('en-US')}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      >
                        Previous
                      </button>
                      <button
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCustomers;