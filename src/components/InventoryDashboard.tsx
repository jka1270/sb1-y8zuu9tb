import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingDown, Clock, Thermometer, MapPin, RefreshCw, CheckCircle, X } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import LoadingSpinner from './LoadingSpinner';

export default function InventoryDashboard() {
  const { 
    inventory, 
    alerts, 
    loading, 
    error, 
    getLowStockItems, 
    getOutOfStockItems, 
    getExpiringItems,
    acknowledgeAlert,
    refetch 
  } = useInventory();

  const [activeTab, setActiveTab] = useState('overview');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterTemperature, setFilterTemperature] = useState('');

  const lowStockItems = getLowStockItems();
  const outOfStockItems = getOutOfStockItems();
  const expiringItems = getExpiringItems();

  const filteredInventory = inventory.filter(item => {
    const matchesLocation = !filterLocation || item.location.includes(filterLocation);
    const matchesTemperature = !filterTemperature || item.temperature_zone === filterTemperature;
    return matchesLocation && matchesTemperature;
  });

  const getStockStatusColor = (item: any) => {
    if (item.current_stock === 0) return 'text-red-600 bg-red-50';
    if (item.current_stock <= item.reorder_point) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStockStatusText = (item: any) => {
    if (item.current_stock === 0) return 'Out of Stock';
    if (item.current_stock <= item.reorder_point) return 'Low Stock';
    return 'In Stock';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'out_of_stock':
        return <X className="h-4 w-4 text-red-500" />;
      case 'low_stock':
        return <TrendingDown className="h-4 w-4 text-yellow-500" />;
      case 'expiring_soon':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertColor = (alertType: string) => {
    switch (alertType) {
      case 'out_of_stock':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'low_stock':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'expiring_soon':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const resolveAlert = (alertId: string) => {
    // Implementation for resolving alert
  };

  const totalValue = inventory.reduce((sum, item) => sum + (item.current_stock * item.cost_per_unit), 0);
  const locations = [...new Set(inventory.map(item => item.location))];
  const temperatureZones = [...new Set(inventory.map(item => item.temperature_zone))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading inventory data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Inventory</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Real-time stock levels and alerts for peptide research products</p>
          </div>
          <button
            onClick={refetch}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <X className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">{outOfStockItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">{expiringItems.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Active Alerts ({alerts.length})</h2>
              <button
                onClick={() => {
                  alerts.forEach(alert => acknowledgeAlert(alert.id));
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Acknowledge All
              </button>
            </div>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border flex items-center justify-between ${getAlertColor(alert.alert_type)}`}
                >
                  <div className="flex items-center">
                    {getAlertIcon(alert.alert_type)}
                    <div className="ml-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {alert.alert_type === 'low_stock' && 'Low Stock Alert'}
                          {alert.alert_type === 'out_of_stock' && 'Out of Stock'}
                          {alert.alert_type === 'expiring_soon' && 'Expiring Soon'}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(alert.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">
                        Product: {alert.inventory?.product_id} | SKU: {alert.inventory?.sku}
                      </p>
                      <p className="text-sm">
                        Current Stock: {alert.current_stock}
                        {alert.threshold_value && ` | Threshold: ${alert.threshold_value}`}
                        {alert.inventory?.location && ` | Location: ${alert.inventory.location}`}
                      </p>
                      {alert.inventory?.expiry_date && (
                        <p className="text-xs text-orange-600 mt-1">
                          Expires: {new Date(alert.inventory.expiry_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="text-sm px-3 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-75 transition-colors"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="text-sm px-3 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-75 transition-colors"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
              {alerts.length > 5 && (
                <div className="text-center pt-3 border-t">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View All {alerts.length} Alerts
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alert Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.alert_type === 'out_of_stock').length}
                </p>
              </div>
              <X className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Out of stock items</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Warning Alerts</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {alerts.filter(a => a.alert_type === 'low_stock').length}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Low stock items</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiry Alerts</p>
                <p className="text-2xl font-bold text-orange-600">
                  {alerts.filter(a => a.alert_type === 'expiring_soon').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Expiring within 30 days</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Temperature Zone</label>
              <select
                value={filterTemperature}
                onChange={(e) => setFilterTemperature(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Temperatures</option>
                {temperatureZones.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterLocation('');
                  setFilterTemperature('');
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Inventory Items ({filteredInventory.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          SKU: {item.sku}
                        </div>
                        <div className="text-sm text-gray-500">
                          Product ID: {item.product_id}
                          {item.variant_id && ` (${item.variant_id})`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Current: {item.current_stock}</div>
                        <div>Available: {item.available_stock}</div>
                        <div className="text-xs text-gray-500">
                          Reserved: {item.reserved_stock}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(item)}`}>
                        {getStockStatusText(item)}
                      </span>
                      {item.current_stock <= item.reorder_point && (
                        <div className="text-xs text-gray-500 mt-1">
                          Reorder at: {item.reorder_point}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {item.location}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Thermometer className="h-3 w-3 mr-1" />
                        {item.temperature_zone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>Batch: {item.batch_number || 'N/A'}</div>
                      <div className="text-xs text-gray-500">
                        Cost: ${item.cost_per_unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.expiry_date ? (
                        <div className={`${new Date(item.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'text-orange-600' : ''}`}>
                          {formatDate(item.expiry_date)}
                        </div>
                      ) : (
                        <span className="text-gray-400">No expiry</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Total Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Storage Locations</p>
              <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Temperature Zones</p>
              <p className="text-2xl font-bold text-gray-900">{temperatureZones.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}