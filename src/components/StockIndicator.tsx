import { Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';

interface StockIndicatorProps {
  sku: string;
  quantity?: number;
  showDetails?: boolean;
  className?: string;
}

export default function StockIndicator({ 
  sku, 
  quantity = 1, 
  showDetails = false, 
  className = '' 
}: StockIndicatorProps) {
  const { getStockLevel, isInStock } = useInventory();
  
  const stockItem = getStockLevel(sku);
  const inStock = isInStock(sku, quantity);

  if (!stockItem) {
    return (
      <div className={`flex items-center text-gray-500 ${className}`}>
        <Package className="h-4 w-4 mr-1" />
        <span className="text-sm">Stock info unavailable</span>
      </div>
    );
  }

  const getStockStatus = () => {
    if (stockItem.current_stock === 0) {
      return {
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        text: 'Out of Stock',
        available: false
      };
    } else if (stockItem.current_stock <= stockItem.reorder_point) {
      return {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        text: 'Low Stock',
        available: inStock
      };
    } else {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        text: 'In Stock',
        available: true
      };
    }
  };

  const status = getStockStatus();
  const Icon = status.icon;

  const isExpiringSoon = stockItem.expiry_date && 
    new Date(stockItem.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div className={`${className}`}>
      <div className="flex items-center">
        <Icon className={`h-4 w-4 mr-2 ${status.color}`} />
        <span className={`text-sm font-medium ${status.color}`}>
          {status.text}
        </span>
        {showDetails && (
          <span className="text-sm text-gray-500 ml-2">
            ({stockItem.available_stock} available)
          </span>
        )}
      </div>
      
      {showDetails && (
        <div className="mt-2 space-y-1">
          <div className="text-xs text-gray-600">
            <div>Current Stock: {stockItem.current_stock}</div>
            <div>Reserved: {stockItem.reserved_stock}</div>
            <div>Available: {stockItem.available_stock}</div>
            {stockItem.reorder_point && (
              <div>Reorder Point: {stockItem.reorder_point}</div>
            )}
          </div>
          
          {stockItem.batch_number && (
            <div className="text-xs text-gray-500">
              Batch: {stockItem.batch_number}
            </div>
          )}
          
          {stockItem.expiry_date && (
            <div className={`text-xs ${isExpiringSoon ? 'text-orange-600' : 'text-gray-500'}`}>
              Expires: {new Date(stockItem.expiry_date).toLocaleDateString()}
              {isExpiringSoon && ' (Soon)'}
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            Location: {stockItem.location} ({stockItem.temperature_zone})
          </div>
        </div>
      )}
      
      {!status.available && quantity > stockItem.available_stock && (
        <div className="mt-1 text-xs text-red-600">
          Insufficient stock for quantity {quantity}
        </div>
      )}
    </div>
  );
}