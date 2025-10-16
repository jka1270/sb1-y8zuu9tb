import { useState, useEffect } from 'react';
import { Bell, X, TrendingDown, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import LoadingSpinner from './LoadingSpinner';

interface AlertsWidgetProps {
  className?: string;
  maxAlerts?: number;
  showHeader?: boolean;
}

export default function AlertsWidget({ 
  className = '', 
  maxAlerts = 5, 
  showHeader = true 
}: AlertsWidgetProps) {
  const { alerts, loading, acknowledgeAlert, resolveAlert, refetch } = useInventory();
  const [isExpanded, setIsExpanded] = useState(false);

  const criticalAlerts = alerts.filter(a => a.alert_type === 'out_of_stock');
  const warningAlerts = alerts.filter(a => a.alert_type === 'low_stock');
  const expiryAlerts = alerts.filter(a => a.alert_type === 'expiring_soon');

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

  const getAlertPriority = (alertType: string) => {
    switch (alertType) {
      case 'out_of_stock':
        return 1;
      case 'expiring_soon':
        return 2;
      case 'low_stock':
        return 3;
      default:
        return 4;
    }
  };

  const sortedAlerts = [...alerts].sort((a, b) => {
    const priorityA = getAlertPriority(a.alert_type);
    const priorityB = getAlertPriority(b.alert_type);
    if (priorityA !== priorityB) return priorityA - priorityB;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const displayAlerts = isExpanded ? sortedAlerts : sortedAlerts.slice(0, maxAlerts);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
        <LoadingSpinner text="Loading alerts..." />
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        {showHeader && (
          <div className="flex items-center mb-4">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Inventory Status</h3>
          </div>
        )}
        <div className="text-center py-4">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="text-green-800 font-medium">All Good!</p>
          <p className="text-sm text-gray-600">No inventory alerts at this time</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Inventory Alerts ({alerts.length})
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refetch}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            {alerts.length > maxAlerts && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {isExpanded ? 'Show Less' : `View All (${alerts.length})`}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Alert Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
            <div className="text-xs text-gray-600">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{warningAlerts.length}</div>
            <div className="text-xs text-gray-600">Warning</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{expiryAlerts.length}</div>
            <div className="text-xs text-gray-600">Expiring</div>
          </div>
        </div>

        {/* Alert List */}
        <div className="space-y-3">
          {displayAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border flex items-start justify-between ${getAlertColor(alert.alert_type)}`}
            >
              <div className="flex items-start">
                {getAlertIcon(alert.alert_type)}
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {alert.alert_type === 'low_stock' && 'Low Stock Alert'}
                      {alert.alert_type === 'out_of_stock' && 'Out of Stock'}
                      {alert.alert_type === 'expiring_soon' && 'Expiring Soon'}
                      {alert.alert_type === 'expired' && 'Expired'}
                    </p>
                    <span className="text-xs opacity-75">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm mt-1">
                    <div className="font-medium">SKU: {alert.inventory?.sku}</div>
                    <div>Product ID: {alert.inventory?.product_id}</div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span>Current: {alert.current_stock}</span>
                      {alert.threshold_value && (
                        <span>Threshold: {alert.threshold_value}</span>
                      )}
                      {alert.inventory?.location && (
                        <span>Location: {alert.inventory.location}</span>
                      )}
                    </div>
                    {alert.inventory?.batch_number && (
                      <div className="text-xs mt-1">
                        Batch: {alert.inventory.batch_number}
                        {alert.inventory.expiry_date && (
                          <span className="ml-2">
                            Expires: {new Date(alert.inventory.expiry_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-1 ml-4">
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-75 transition-colors"
                >
                  Acknowledge
                </button>
                <button
                  onClick={() => resolveAlert(alert.id)}
                  className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-75 transition-colors"
                >
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bulk Actions */}
        {alerts.length > 1 && (
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => {
                  alerts.forEach(alert => acknowledgeAlert(alert.id));
                }}
                className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
              >
                Acknowledge All
              </button>
              <button
                onClick={() => {
                  const criticalOnly = alerts.filter(a => a.alert_type === 'out_of_stock');
                  criticalOnly.forEach(alert => acknowledgeAlert(alert.id));
                }}
                className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Acknowledge Critical
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}