import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface OrderTrackingWidgetProps {
  orderNumber: string;
  status: string;
  shippingMethod: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export default function OrderTrackingWidget({ 
  orderNumber, 
  status, 
  shippingMethod,
  estimatedDelivery,
  trackingNumber 
}: OrderTrackingWidgetProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      key: 'pending',
      label: 'Order Placed',
      description: 'Your order has been received and is being prepared',
      icon: Package,
      completed: true
    },
    {
      key: 'processing',
      label: 'Processing',
      description: 'Amino acid chains are being prepared and packaged with cold chain materials',
      icon: Package,
      completed: false
    },
    {
      key: 'shipped',
      label: 'Shipped',
      description: 'Your order is on its way with temperature monitoring',
      icon: Truck,
      completed: false
    },
    {
      key: 'delivered',
      label: 'Delivered',
      description: 'Order has been delivered successfully',
      icon: CheckCircle,
      completed: false
    }
  ];

  useEffect(() => {
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const index = statusOrder.indexOf(status);
    setCurrentStep(index >= 0 ? index : 0);
  }, [status]);

  const updatedSteps = steps.map((step, index) => ({
    ...step,
    completed: index <= currentStep,
    current: index === currentStep
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'processing':
        return 'text-blue-600';
      case 'shipped':
        return 'text-purple-600';
      case 'delivered':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Order #{orderNumber}
          </h3>
          <p className={`text-sm font-medium ${getStatusColor(status)}`}>
            Status: {status.charAt(0).toUpperCase() + status.slice(1)}
          </p>
        </div>
        {trackingNumber && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Tracking Number</p>
            <p className="font-mono text-sm font-medium">{trackingNumber}</p>
          </div>
        )}
      </div>

      {/* Progress Timeline */}
      <div className="space-y-4">
        {updatedSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex items-start">
              <div className="flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed
                      ? 'bg-green-600 text-white'
                      : step.current
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {index < updatedSteps.length - 1 && (
                  <div
                    className={`w-0.5 h-8 mx-auto mt-2 ${
                      step.completed ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
              <div className="ml-4 flex-1">
                <h4
                  className={`font-medium ${
                    step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </h4>
                <p
                  className={`text-sm mt-1 ${
                    step.completed || step.current ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  {step.description}
                </p>
                {step.current && estimatedDelivery && (
                  <p className="text-sm text-blue-600 mt-1">
                    Estimated delivery: {estimatedDelivery}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shipping Information */}
      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-gray-900 mb-1">Shipping Method</h5>
            <p className="text-sm text-gray-600">
              {shippingMethod === 'express' ? 'Express Cold Chain' : 'Standard Cold Chain'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Temperature controlled shipping with monitoring
            </p>
          </div>
          {status === 'shipped' && (
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Temperature Status</h5>
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Maintained within range
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Real-time monitoring active
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Special Handling Notice */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Cold Chain Handling:</strong> Your amino acid chains are being shipped with specialized
            temperature-controlled packaging to ensure product integrity throughout transit.
          </div>
        </div>
      </div>
    </div>
  );
}