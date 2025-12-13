import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { Download, Calendar, Clock, TrendingUp, DollarSign, BarChart3, FileText } from 'lucide-react';

const AdminReports = () => {
  const [activeReport, setActiveReport] = useState('revenue');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Date range state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [period, setPeriod] = useState('week');

  // Report data
  const [revenueData, setRevenueData] = useState(null);
  const [detailedData, setDetailedData] = useState([]);

  // Fetch initial data for current period
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const params = { period: 'week' };
        const data = await adminApi.getAnalytics(params);
        setRevenueData(data);
        setReportData(data);
        setDetailedData(data.revenueByDay || []);
      } catch (error) {
        console.error('Failed to fetch initial report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const fetchReportData = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    setLoading(true);
    try {
      const params = {
        startDate,
        endDate
      };
      const data = await adminApi.getAnalytics(params);

      setRevenueData(data);
      setReportData(data);
      setDetailedData(data.revenueByDay || []);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!detailedData || detailedData.length === 0) {
      alert('No data to export');
      return;
    }

    // Prepare CSV content
    let csvContent = 'Date,Revenue,Orders\n';

    detailedData.forEach(item => {
      const date = formatDate(item.date);
      const revenue = item.revenue;
      const orders = item.orders;
      csvContent += `${date},${revenue},${orders}\n`;
    });

    // Add summary row
    csvContent += '\n';
    csvContent += `Summary,,\n`;
    csvContent += `Total Revenue,${revenueData?.totals?.totalRevenue || 0},\n`;
    csvContent += `Total Orders,${revenueData?.totals?.totalOrders || 0},\n`;
    csvContent += `Average Order Value,${revenueData?.totals?.avgOrderValue || 0},\n`;

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const filename = `revenue-report-${startDate}-to-${endDate}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg p-6 shadow">
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-4 bg-gray-300 rounded"></div>
                ))}
              </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
              <p className="text-gray-600 mt-1">Generate and export detailed business reports</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportToCSV}
                disabled={loading || !detailedData.length}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Date Range Controls */}
        <div className="bg-white rounded-lg p-6 shadow mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Revenue Report</h2>
            <div className="flex items-center space-x-2 text-gray-600">
              <TrendingUp className="h-5 w-5" />
              <span>Custom Date Range</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  max={endDate || undefined}
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={startDate || undefined}
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex items-end">
              <button
                onClick={fetchReportData}
                disabled={loading || !startDate || !endDate}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Generate Report</span>
              </button>
            </div>
          </div>

          {/* Date Range Helper Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                setStartDate(weekAgo.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                setStartDate(monthAgo.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Last 30 Days
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
                setStartDate(yearAgo.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Last Year
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {revenueData && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600">Total Revenue</div>
                  <div className="text-2xl font-bold mt-2">{formatCurrency(revenueData.totals.totalRevenue)}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {startDate && endDate ? `${formatDate(startDate)} to ${formatDate(endDate)}` : 'Selected period'}
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600">Total Orders</div>
                  <div className="text-2xl font-bold mt-2">{revenueData.totals.totalOrders}</div>
                  <div className="text-xs text-gray-500 mt-1">Completed orders</div>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            {/* Average Order Value */}
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600">Average Order Value</div>
                  <div className="text-2xl font-bold mt-2">{formatCurrency(revenueData.totals.avgOrderValue)}</div>
                  <div className="text-xs text-gray-500 mt-1">Per order</div>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            {/* Date Range */}
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600">Report Period</div>
                  {startDate && endDate ? (
                    <div className="text-2xl font-bold mt-2">
                      {formatDate(startDate)} to {formatDate(endDate)}
                    </div>
                  ) : (
                    <div className="text-2xl font-bold mt-2 capitalize">{revenueData.period}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">Customizable range</div>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}

        {/* Detailed Data Table */}
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Daily Revenue Breakdown</h2>
            <div className="text-sm text-gray-500">
              {detailedData.length} days in period
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-medium">Date</th>
                  <th className="text-left py-2 px-4 font-medium">Revenue</th>
                  <th className="text-left py-2 px-4 font-medium">Orders</th>
                  <th className="text-left py-2 px-4 font-medium">Avg Order Value</th>
                </tr>
              </thead>
              <tbody>
                {detailedData.map((day, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4 font-medium">{formatDate(day.date)}</td>
                    <td className="py-3 px-4">{formatCurrency(day.revenue)}</td>
                    <td className="py-3 px-4">{day.orders}</td>
                    <td className="py-3 px-4">
                      {day.orders > 0 ? formatCurrency(day.revenue / day.orders) : formatCurrency(0)}
                    </td>
                  </tr>
                ))}
                {detailedData.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      No data available for the selected date range
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;