import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, Eye, Download, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import { useOrders, Order } from '../hooks/useOrders';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import OrderDetailModal from './OrderDetailModal';
import LoadingSpinner from './LoadingSpinner';

interface OrderHistoryPageProps {
  onBack: () => void;
}

export default function OrderHistoryPage({ onBack }: OrderHistoryPageProps) {
  const { orders, loading, error, refetch } = useOrders();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <Clock className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const handleDownloadInvoice = (order: Order) => {
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
      pdf.text(order.order_number || 'N/A', 60, yPos);

      yPos += 6;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Order Date:', 20, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formatDate(order.created_at), 60, yPos);

      yPos += 6;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Payment Status:', 20, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text((order.payment_status || 'pending').charAt(0).toUpperCase() + (order.payment_status || 'pending').slice(1), 60, yPos);

      yPos += 6;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Order Status:', 20, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text((order.status || 'processing').charAt(0).toUpperCase() + (order.status || 'processing').slice(1), 60, yPos);

      yPos += 12;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bill To:', 20, yPos);
      pdf.setFont('helvetica', 'normal');

      const addr = order.shipping_address || {};

      yPos += 6;
      const fullName = [addr.firstName, addr.lastName].filter(Boolean).join(' ') || 'N/A';
      pdf.text(fullName, 20, yPos);

      if (addr.company) {
        yPos += 5;
        pdf.text(addr.company, 20, yPos);
      }

      if (addr.address1) {
        yPos += 5;
        pdf.text(addr.address1, 20, yPos);
      }

      if (addr.city || addr.state || addr.zipCode) {
        yPos += 5;
        const cityStateZip = [addr.city, `${addr.state || ''} ${addr.zipCode || ''}`.trim()].filter(Boolean).join(', ');
        pdf.text(cityStateZip, 20, yPos);
      }

      if (addr.email) {
        yPos += 5;
        pdf.text(addr.email, 20, yPos);
      }

      if (addr.phone) {
        yPos += 5;
        pdf.text(addr.phone, 20, yPos);
      }

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
      console.error('Order data:', order);
      showNotification({
        type: 'error',
        message: `Failed to download invoice: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: 5000
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-600">You need to be logged in to view your order history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-end">
            <button
              onClick={refetch}
              className="flex items-center text-gray-600 hover:text-gray-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
          <p className="text-gray-600">Track and manage your peptide research orders</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'all', label: 'All Orders' },
                { key: 'pending', label: 'Pending' },
                { key: 'processing', label: 'Processing' },
                { key: 'shipped', label: 'Shipped' },
                { key: 'delivered', label: 'Delivered' },
                { key: 'cancelled', label: 'Cancelled' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    statusFilter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {statusCounts[tab.key as keyof typeof statusCounts] > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {statusCounts[tab.key as keyof typeof statusCounts]}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Loading your orders..." />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-8">
            <p className="text-red-800">Error loading orders: {error}</p>
            <button
              onClick={refetch}
              className="mt-2 text-red-600 hover:text-red-700 font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && (
          <>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter} orders`}
                </h3>
                <p className="text-gray-600 mb-6">
                  {statusFilter === 'all' 
                    ? 'Start shopping for research peptides to see your orders here.'
                    : `You don't have any ${statusFilter} orders at the moment.`
                  }
                </p>
                {statusFilter === 'all' && (
                  <button
                    onClick={onBack}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Start Shopping
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Order #{order.order_number}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Placed on {formatDate(order.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(order.status)}
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {formatPrice(order.total_amount)}
                          </div>
                          <div className={`text-sm px-2 py-1 rounded ${getPaymentStatusColor(order.payment_status)}`}>
                            Payment {order.payment_status}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Shipping Address</h4>
                          <div className="text-sm text-gray-600">
                            <div>{order.shipping_address.firstName} {order.shipping_address.lastName}</div>
                            <div>{order.shipping_address.company}</div>
                            <div>{order.shipping_address.address1}</div>
                            <div>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Shipping Method</h4>
                          <div className="text-sm text-gray-600">
                            {order.shipping_method === 'express' ? 'Express Cold Chain' : 'Standard Cold Chain'}
                            <div className="text-xs text-gray-500 mt-1">
                              Temperature controlled shipping
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Order Summary</h4>
                          <div className="text-sm text-gray-600">
                            <div>Subtotal: {formatPrice(order.subtotal)}</div>
                            <div>Shipping: {formatPrice(order.shipping_cost)}</div>
                            <div>Tax: {formatPrice(order.tax_amount)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      {order.order_items && order.order_items.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Items ({order.order_items.length})
                          </h4>
                          <div className="space-y-2">
                            {order.order_items.slice(0, 3).map((item) => (
                              <div key={item.id} className="flex items-center justify-between text-sm">
                                <div>
                                  <span className="font-medium">{item.product_name}</span>
                                  <span className="text-gray-500 ml-2">
                                    {item.size} × {item.quantity}
                                  </span>
                                </div>
                                <span className="text-gray-900">
                                  {formatPrice(item.total_price)}
                                </span>
                              </div>
                            ))}
                            {order.order_items.length > 3 && (
                              <div className="text-sm text-gray-500">
                                +{order.order_items.length - 3} more items
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(order)}
                            className="flex items-center text-gray-600 hover:text-gray-700"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download Invoice
                          </button>
                        </div>
                        {order.status === 'shipped' && (
                          <button className="text-blue-600 hover:text-blue-700 font-medium">
                            Track Package
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}