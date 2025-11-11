import { Package, AlertTriangle, CheckCircle } from 'lucide-react';

interface StockIndicatorProps {
  sku: string;
  quantity?: number;
  showDetails?: boolean;
  className?: string;
  inStock?: boolean;
}

export default function StockIndicator({
  sku,
  quantity = 1,
  showDetails = false,
  className = '',
  inStock = true
}: StockIndicatorProps) {

  const getStockStatus = () => {
    if (!inStock) {
      return {
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        text: 'Out of Stock',
        available: false
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

  return (
    <div className={`${className}`}>
      <div className="flex items-center">
        <Icon className={`h-4 w-4 mr-2 ${status.color}`} />
        <span className={`text-sm font-medium ${status.color}`}>
          {status.text}
        </span>
      </div>
    </div>
  );
}
