import { useState, useEffect } from 'react';
import { Package, TrendingUp, TrendingDown, AlertTriangle, RefreshCw } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import LoadingSpinner from './LoadingSpinner';

interface RealTimeInventoryWidgetProps {
  className?: string;
  productIds?: string[];
  showAlerts?: boolean;
}

export default function RealTimeInventoryWidget({ 
  className = '',
  productIds = [],
  showAlerts = true
}: RealTimeInventoryWidgetProps) {
  const { inventory, alerts, loading, refetch } = useInventory();
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      refetch();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  const filteredInventory = productIds.length > 0 
    ? inventory.filter(item => productIds.includes(item.product_id))
    : inventory;

  const totalValue = filteredInventory.reduce(
    (sum, item) => sum + (item.current_stock * item.cost_per_unit), 
    0
  );

  const lowStockCount = filteredInventory.filter(
    item => item.current_stock <= item.reorder_point
  ).length;

  const outOfStockCount = filteredInventory.filter(
    item => item.current_stock === 0
  ).length;

  const totalItems = filteredInventory.reduce(
    (sum, item) => sum + item.current_stock, 
    0
  );

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <LoadingSpinner text="Loading inventory data..." />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Real-Time Inventory
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
            <button
              onClick={refetch}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredInventory.length}</div>
            <div className="text-xs text-gray-600">Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalItems.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Total Units</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
            <div className="text-xs text-gray-600">Low Stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
            <div className="text-xs text-gray-600">Out of Stock</div>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Total Inventory Value</p>
              <p className="text-2xl font-bold text-blue-900">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Recent Alerts */}
        {showAlerts && alerts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Recent Alerts</h4>
              <span className="text-xs text-gray-500">
                {alerts.length} active
              </span>
            </div>
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded border text-sm ${getAlertColor(alert.alert_type)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getAlertIcon(alert.alert_type)}
                      <span className="ml-2 font-medium">
                        {alert.inventory?.sku}
                      </span>
                    </div>
                    <span className="text-xs">
                      Stock: {alert.current_stock}
                    </span>
                  </div>
                  <div className="mt-1 text-xs opacity-75">
                    {alert.alert_type === 'low_stock' && 'Below reorder point'}
                    {alert.alert_type === 'out_of_stock' && 'No stock available'}
                    {alert.alert_type === 'expiring_soon' && 'Expires within 30 days'}
                  </div>
                </div>
              ))}
              {alerts.length > 3 && (
                <div className="text-center pt-2">
                  <button className="text-xs text-blue-600 hover:text-blue-700">
                    View {alerts.length - 3} more alerts
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-2">
            <button className="text-sm px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              View Full Dashboard
            </button>
            <button className="text-sm px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}