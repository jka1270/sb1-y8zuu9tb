<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { useInventory } from '../hooks/useInventory';
=======
import { useState } from 'react';
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
>>>>>>> c7bfe8dc5fa8f702766366e53572fdd68007ce3d
import LoadingSpinner from './LoadingSpinner';

export default function AdminDashboard() {
  const { orders, loading: ordersLoading } = useOrders();
<<<<<<< HEAD
  const { inventory, alerts, loading: inventoryLoading } = useInventory();
  const [dateRange, setDateRange] = useState('7d');
=======
>>>>>>> c7bfe8dc5fa8f702766366e53572fdd68007ce3d
  const [refreshing, setRefreshing] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

<<<<<<< HEAD
  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const lowStockItems = inventory.filter(item => item.current_stock <= item.reorder_point).length;
  const outOfStockItems = inventory.filter(item => item.current_stock === 0).length;

  const recentOrders = orders.slice(0, 5);
  const criticalAlerts = alerts.filter(a => a.alert_type === 'out_of_stock').length;

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (ordersLoading || inventoryLoading) {
=======
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const recentOrders = orders.slice(0, 5);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (ordersLoading) {
>>>>>>> c7bfe8dc5fa8f702766366e53572fdd68007ce3d
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" text="Loading dashboard data..." />
      </div>
    );
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
<<<<<<< HEAD
      {/* Refresh Button */}
=======
>>>>>>> c7bfe8dc5fa8f702766366e53572fdd68007ce3d
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

<<<<<<< HEAD
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
=======
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
>>>>>>> c7bfe8dc5fa8f702766366e53572fdd68007ce3d
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5% from last month
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              <p className="text-sm text-blue-600">
                {pendingOrders} pending
              </p>
            </div>
          </div>
        </div>
<<<<<<< HEAD

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockItems}</p>
              <p className="text-sm text-orange-600">
                {outOfStockItems} out of stock
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{criticalAlerts}</p>
              <p className="text-sm text-red-600">
                Require immediate attention
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">#{order.order_number}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{formatPrice(order.total_amount)}</div>
                  <span className={`text-xs px-2 py-1 rounded ${getOrderStatusColor(order.status)}`}>
                    {order.status}
                  </span>
=======
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders yet</p>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <p className="font-semibold text-gray-900">{formatPrice(order.total_amount)}</p>
>>>>>>> c7bfe8dc5fa8f702766366e53572fdd68007ce3d
                </div>
              </div>
            ))}
          </div>
<<<<<<< HEAD
        </div>

        {/* Inventory Alerts */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {alert.alert_type === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                    </div>
                    <div className="text-sm text-gray-500">
                      SKU: {alert.inventory?.sku}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-red-600">
                    Stock: {alert.current_stock}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{inventory.length}</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
            <div className="text-sm text-gray-600">Completed Orders</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {new Set(orders.map(o => o.user_id)).size}
            </div>
            <div className="text-sm text-gray-600">Active Customers</div>
          </div>
        </div>
      </div>
    </div>
  );
}
=======
        )}
      </div>
    </div>
  );
}
>>>>>>> c7bfe8dc5fa8f702766366e53572fdd68007ce3d
