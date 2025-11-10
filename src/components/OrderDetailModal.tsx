import { useState } from 'react';
import { X, Package, Truck, MapPin, CreditCard, FileText, Download, ExternalLink } from 'lucide-react';
import jsPDF from 'jspdf';
import { Order } from '../hooks/useOrders';
import { useCOA } from '../hooks/useCOA';
import { useNotification } from '../contexts/NotificationContext';
import COAViewer from './COAViewer';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const { getCOABySKU } = useCOA();
  const { showNotification } = useNotification();
  const [showCOA, setShowCOA] = useState(false);
  const [selectedCOA, setSelectedCOA] = useState<any>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: 'Order Placed', completed: true },
      { key: 'processing', label: 'Processing', completed: false },
      { key: 'shipped', label: 'Shipped', completed: false },
      { key: 'delivered', label: 'Delivered', completed: false },
    ];

    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  const handleViewCOA = (sku: string) => {
    const coas = getCOABySKU(sku);
    if (coas.length > 0) {
      setSelectedCOA(coas[0]); // Use the first available COA
      setShowCOA(true);
    }
  };

  const handleDownloadInvoice = () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPos = 20;

      pdf.setFontSize(20);
      pdf.setTextColor(37, 99, 235);
      pdf.text('Research Peptides Direct', pageWidth / 2, yPos, { align: 'center' });

      yPos += 10;
      pdf.setFontSize(16);
      pdf.text('INVOICE', pageWidth / 2, yPos, { align: 'center' });

      yPos += 15;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      pdf.setFont('helvetica', 'bold');
      pdf.text('Invoice Number:', 20, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(order.order_number, 60, yPos);

      yPos += 6;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Order Date:', 20, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formatDate(order.created_at), 60, yPos);

      yPos += 6;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Payment Status:', 20, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1), 60, yPos);

      yPos += 6;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Order Status:', 20, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(order.status.charAt(0).toUpperCase() + order.status.slice(1), 60, yPos);

      yPos += 12;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bill To:', 20, yPos);
      pdf.setFont('helvetica', 'normal');

      yPos += 6;
      pdf.text(`${order.shipping_address.firstName} ${order.shipping_address.lastName}`, 20, yPos);

      if (order.shipping_address.company) {
        yPos += 5;
        pdf.text(order.shipping_address.company, 20, yPos);
      }

      yPos += 5;
      pdf.text(order.shipping_address.address1, 20, yPos);

      yPos += 5;
      pdf.text(`${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zipCode}`, 20, yPos);

      yPos += 5;
      pdf.text(order.shipping_address.email, 20, yPos);

      yPos += 5;
      pdf.text(order.shipping_address.phone, 20, yPos);

      yPos += 15;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('Order Items', 20, yPos);

      yPos += 8;
      pdf.setFontSize(9);
      pdf.setFillColor(243, 244, 246);
      pdf.rect(20, yPos - 5, pageWidth - 40, 7, 'F');

      pdf.text('Product', 22, yPos);
      pdf.text('Size', 100, yPos);
      pdf.text('Qty', 125, yPos);
      pdf.text('Price', pageWidth - 35, yPos, { align: 'right' });

      yPos += 8;
      pdf.setFont('helvetica', 'normal');

      order.order_items?.forEach((item) => {
        if (yPos > 260) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.text(item.product_name.substring(0, 35), 22, yPos);
        pdf.text(item.size, 100, yPos);
        pdf.text(item.quantity.toString(), 125, yPos);
        pdf.text(formatPrice(item.total_price), pageWidth - 35, yPos, { align: 'right' });

        yPos += 6;
      });

      yPos += 10;
      pdf.line(20, yPos, pageWidth - 20, yPos);

      yPos += 8;
      pdf.text('Subtotal:', pageWidth - 70, yPos);
      pdf.text(formatPrice(order.subtotal), pageWidth - 35, yPos, { align: 'right' });

      yPos += 6;
      pdf.text(`Shipping (${order.shipping_method === 'express' ? 'Express' : 'Standard'} Cold Chain):`, pageWidth - 70, yPos);
      pdf.text(formatPrice(order.shipping_cost), pageWidth - 35, yPos, { align: 'right' });

      yPos += 6;
      pdf.text('Tax:', pageWidth - 70, yPos);
      pdf.text(formatPrice(order.tax_amount), pageWidth - 35, yPos, { align: 'right' });

      yPos += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.line(pageWidth - 70, yPos - 2, pageWidth - 20, yPos - 2);
      pdf.text('Total:', pageWidth - 70, yPos);
      pdf.text(formatPrice(order.total_amount), pageWidth - 35, yPos, { align: 'right' });

      yPos += 15;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Note: This is a computer-generated invoice and does not require a signature.', 20, yPos);
      yPos += 4;
      pdf.text('For research use only. Not for human or veterinary use.', 20, yPos);

      pdf.save(`invoice-${order.order_number}.pdf`);

      showNotification({
        type: 'success',
        message: 'Invoice downloaded successfully',
        duration: 3000
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      showNotification({
        type: 'error',
        message: 'Failed to download invoice',
        duration: 3000
      });
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Order #{order.order_number}
              </h2>
              <p className="text-gray-600">Placed on {formatDate(order.created_at)}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Order Status Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
              <div className="flex items-center justify-between">
                {getStatusSteps().map((step, index) => (
                  <div key={step.key} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.completed
                            ? 'bg-green-600 text-white'
                            : step.current
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {step.completed ? (
                          <Package className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <span
                        className={`mt-2 text-sm font-medium ${
                          step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < getStatusSteps().length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-4 ${
                          step.completed ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-4">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                        <div className="text-sm text-gray-600 mt-1">
                          <span>SKU: {item.product_sku}</span>
                          <span className="mx-2">•</span>
                          <span>Size: {item.size}</span>
                          <span className="mx-2">•</span>
                          <span>Purity: {item.purity}</span>
                          <span className="mx-2">•</span>
                          <span>MW: {item.molecular_weight}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {formatPrice(item.unit_price)} × {item.quantity}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total: {formatPrice(item.total_price)}
                        </div>
                        <button
                          onClick={() => handleViewCOA(item.product_sku)}
                          className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                        >
                          View COA
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Addresses and Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Address
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-1 text-gray-700">
                    <div className="font-medium">
                      {order.shipping_address.firstName} {order.shipping_address.lastName}
                    </div>
                    <div>{order.shipping_address.company}</div>
                    <div>{order.shipping_address.address1}</div>
                    {order.shipping_address.address2 && (
                      <div>{order.shipping_address.address2}</div>
                    )}
                    <div>
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
                    </div>
                    <div>{order.shipping_address.country}</div>
                    <div className="pt-2 text-sm text-gray-600">
                      Phone: {order.shipping_address.phone}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium capitalize">{order.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`font-medium capitalize ${
                        order.payment_status === 'paid' ? 'text-green-600' : 
                        order.payment_status === 'pending' ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {order.payment_status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Billing Email:</span>
                      <span className="font-medium">{order.billing_address.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Shipping Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Shipping Method:</span>
                    <div className="font-medium">
                      {order.shipping_method === 'express' ? 'Express Cold Chain Shipping' : 'Standard Cold Chain Shipping'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Temperature controlled • Insulated packaging
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Shipping Cost:</span>
                    <div className="font-medium">{formatPrice(order.shipping_cost)}</div>
                    {order.status === 'shipped' && (
                      <button className="text-blue-600 hover:text-blue-700 text-sm mt-1 flex items-center">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Track Package
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span>{formatPrice(order.shipping_cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span>{formatPrice(order.tax_amount)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span>{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Research Compliance Notice */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Research Use Only:</strong> This order contains peptides intended solely for research purposes. 
                  Not for human consumption. Please ensure proper storage and handling according to safety protocols.
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <div className="space-x-3">
                <button
                  onClick={handleDownloadInvoice}
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download Invoice
                </button>
                <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
                  <FileText className="h-4 w-4 mr-1" />
                  Download COAs
                </button>
              </div>
              {order.status === 'delivered' && (
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Reorder Items
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* COA Viewer Modal */}
      {showCOA && selectedCOA && (
        <COAViewer 
          coa={selectedCOA} 
          onClose={() => setShowCOA(false)}
          orderId={order.id}
        />
      )}
    </>
  );
}