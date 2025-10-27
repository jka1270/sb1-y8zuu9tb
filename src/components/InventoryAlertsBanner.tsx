import { useState } from 'react';
import { AlertTriangle, X, TrendingDown, Clock, Package, ChevronRight } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';

interface InventoryAlertsBannerProps {
  onViewInventory?: () => void;
}

export default function InventoryAlertsBanner({ onViewInventory }: InventoryAlertsBannerProps) {
  const { alerts, acknowledgeAlert } = useInventory();
  const [dismissed, setDismissed] = useState(false);

  const criticalAlerts = alerts.filter(a => a.alert_type === 'out_of_stock');
  const warningAlerts = alerts.filter(a => a.alert_type === 'low_stock');
  const expiryAlerts = alerts.filter(a => a.alert_type === 'expiring_soon');

  const totalAlerts = alerts.length;

  if (dismissed || totalAlerts === 0) {
    return null;
  }

  const getBannerStyle = () => {
    if (criticalAlerts.length > 0) {
      return 'bg-red-50 border-red-200 text-red-800';
    } else if (expiryAlerts.length > 0) {
      return 'bg-orange-50 border-orange-200 text-orange-800';
    } else {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  const getBannerIcon = () => {
    if (criticalAlerts.length > 0) {
      return <X className="h-5 w-5 text-red-600" />;
    } else if (expiryAlerts.length > 0) {
      return <Clock className="h-5 w-5 text-orange-600" />;
    } else {
      return <TrendingDown className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getPrimaryMessage = () => {
    if (criticalAlerts.length > 0) {
      return `${criticalAlerts.length} product${criticalAlerts.length !== 1 ? 's' : ''} out of stock`;
    } else if (expiryAlerts.length > 0) {
      return `${expiryAlerts.length} product${expiryAlerts.length !== 1 ? 's' : ''} expiring soon`;
    } else {
      return `${warningAlerts.length} product${warningAlerts.length !== 1 ? 's' : ''} low in stock`;
    }
  };

  return (
    <div className={`border rounded-lg p-4 mb-6 ${getBannerStyle()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getBannerIcon()}
          <div className="ml-3">
            <div className="font-medium">
              Inventory Alert: {getPrimaryMessage()}
            </div>
            <div className="text-sm mt-1 opacity-90">
              {totalAlerts > 1 && `${totalAlerts} total alerts requiring attention. `}
              Immediate action recommended to prevent research disruption.
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onViewInventory && (
            <button
              onClick={onViewInventory}
              className="flex items-center text-sm font-medium hover:underline"
            >
              View Inventory
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick Alert Summary */}
      {totalAlerts > 1 && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <div className="flex items-center space-x-6 text-sm">
            {criticalAlerts.length > 0 && (
              <div className="flex items-center">
                <X className="h-4 w-4 mr-1" />
                <span>{criticalAlerts.length} Critical</span>
              </div>
            )}
            {warningAlerts.length > 0 && (
              <div className="flex items-center">
                <TrendingDown className="h-4 w-4 mr-1" />
                <span>{warningAlerts.length} Low Stock</span>
              </div>
            )}
            {expiryAlerts.length > 0 && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{expiryAlerts.length} Expiring</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}