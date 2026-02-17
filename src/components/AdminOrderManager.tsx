import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Package, Truck, CheckCircle, Clock, AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { useOrders, Order } from '../hooks/useOrders';
import { useNotification } from '../contexts/NotificationContext';
import LoadingSpinner from './LoadingSpinner';

export default function AdminOrderManager() {
  const { orders, loading, error, updateOrderStatus, syncToShipStation, getTracking, updateTracking, refetch } = useOrders();
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.shipping_address.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.shipping_address.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.shipping_address.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesDate = !dateFilter || order.created_at.startsWith(dateFilter);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showNotification({
        type: 'success',
        message: 'Order status updated successfully',
        duration: 3000
      });
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to update order status',
        duration: 5000
      });
    }
  };

  const handleSyncToShipStation = async (orderId: string) => {
    try {
      const result = await syncToShipStation(orderId);
      showNotification({
        type: 'success',
        message: `Order synced to ShipStation successfully! Order ID: ${result.shipstationOrderId}`,
        duration: 5000
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('ShipStation sync error:', error);
      showNotification({
        type: 'error',
        message: `Failed to sync to ShipStation: ${errorMessage}`,
        duration: 5000
      });
    }
  };

  const handleGetTracking = async (orderId: string) => {
    try {
      const result = await getTracking(orderId);
      if (result.tracking) {
        showNotification({
          type: 'info',
          message: `Tracking #: ${result.tracking.trackingNumber} | Carrier: ${result.tracking.carrier} | Status: ${result.tracking.status}`,
          duration: 7000
        });
      }
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to get tracking info',
        duration: 5000
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleOpenTrackingModal = (order: Order) => {
    setTrackingModalOrder(order);
    setTrackingNumber(order.tracking_number || '');
    setCarrier(order.carrier || '');
  };

  const handleCloseTrackingModal = () => {
    setTrackingModalOrder(null);
    setTrackingNumber('');
    setCarrier('');
  };

  const handleUpdateTracking = async () => {
    if (!trackingModalOrder || !trackingNumber.trim() || !carrier.trim()) {
      showNotification({
        type: 'error',
        message: 'Please enter both tracking number and carrier',
        duration: 3000
      });
      return;
    }

    try {
      await updateTracking(trackingModalOrder.id, trackingNumber.trim(), carrier.trim());
      showNotification({
        type: 'success',
        message: 'Tracking information updated successfully',
        duration: 3000
      });
      handleCloseTrackingModal();
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to update tracking information',
        duration: 5000
      });
    }
  };

  const handleDownloadPDF = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showNotification({
        type: 'error',
        message: 'Please allow pop-ups to download the invoice',
        duration: 3000
      });
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order.order_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .invoice-header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
          .invoice-header h1 { color: #2563eb; font-size: 32px; margin-bottom: 10px; }
          .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-section h3 { color: #2563eb; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; }
          .info-section p { margin: 5px 0; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          th { background-color: #2563eb; color: white; padding: 12px; text-align: left; font-weight: 600; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          tr:hover { background-color: #f9fafb; }
          .total-section { margin-top: 30px; text-align: right; }
          .total-row { display: flex; justify-content: flex-end; margin: 10px 0; font-size: 16px; }
          .total-row span:first-child { margin-right: 20px; font-weight: 600; }
          .grand-total { font-size: 20px; color: #2563eb; font-weight: bold; border-top: 2px solid #2563eb; padding-top: 15px; margin-top: 15px; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
          @media print {
            body { padding: 20px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <h1>INVOICE</h1>
          <p style="color: #6b7280;">Order #${order.order_number}</p>
        </div>

        <div class="invoice-info">
          <div class="info-section">
            <h3>Bill To:</h3>
            <p><strong>${order.billing_address.firstName} ${order.billing_address.lastName}</strong></p>
            ${order.billing_address.company ? `<p>${order.billing_address.company}</p>` : ''}
            <p>${order.billing_address.street}</p>
            ${order.billing_address.apartment ? `<p>${order.billing_address.apartment}</p>` : ''}
            <p>${order.billing_address.city}, ${order.billing_address.state} ${order.billing_address.zipCode}</p>
            <p>${order.billing_address.country}</p>
            <p>Email: ${order.billing_address.email}</p>
            <p>Phone: ${order.billing_address.phone}</p>
          </div>

          <div class="info-section">
            <h3>Ship To:</h3>
            <p><strong>${order.shipping_address.firstName} ${order.shipping_address.lastName}</strong></p>
            ${order.shipping_address.company ? `<p>${order.shipping_address.company}</p>` : ''}
            <p>${order.shipping_address.street}</p>
            ${order.shipping_address.apartment ? `<p>${order.shipping_address.apartment}</p>` : ''}
            <p>${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zipCode}</p>
            <p>${order.shipping_address.country}</p>
          </div>

          <div class="info-section">
            <h3>Invoice Details:</h3>
            <p><strong>Date:</strong> ${formatDate(order.created_at)}</p>
            <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
            <p><strong>Payment:</strong> ${order.payment_status}</p>
            ${order.tracking_number ? `<p><strong>Tracking:</strong> ${order.tracking_number}</p>` : ''}
            ${order.carrier ? `<p><strong>Carrier:</strong> ${order.carrier}</p>` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.order_items?.map(item => `
              <tr>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>${formatPrice(item.price)}</td>
                <td>${formatPrice(item.quantity * item.price)}</td>
              </tr>
            `).join('') || '<tr><td colspan="4">No items</td></tr>'}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatPrice(order.total_amount)}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total:</span>
            <span>${formatPrice(order.total_amount)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p style="margin-top: 10px;">This is a computer-generated invoice.</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="background-color: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">Print / Save as PDF</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleExportOrders = () => {
    try {
      const csvHeaders = [
        'Order Number',
        'Customer Name',
        'Email',
        'Status',
        'Total',
        'Payment Method',
        'Date',
        'Shipping Address',
        'Phone'
      ];

      const csvRows = filteredOrders.map(order => [
        order.order_number,
        `${order.shipping_address.firstName} ${order.shipping_address.lastName}`,
        order.user_email || 'Guest',
        order.status,
        formatPrice(order.total_amount),
        order.payment_method,
        formatDate(order.created_at),
        `${order.shipping_address.address1}, ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zipCode}`,
        order.shipping_address.phone || ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification({
        type: 'success',
        message: `Exported ${filteredOrders.length} orders successfully`,
        duration: 3000
      });
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to export orders',
        duration: 5000
      });
    }
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
            <p className="text-gray-600">Monitor and manage customer orders</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleExportOrders}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{orderStats.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{orderStats.processing}</div>
            <div className="text-xs text-gray-600">Processing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{orderStats.shipped}</div>
            <div className="text-xs text-gray-600">Shipped</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{orderStats.delivered}</div>
            <div className="text-xs text-gray-600">Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{orderStats.cancelled}</div>
            <div className="text-xs text-gray-600">Cancelled</div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setDateFilter('');
              }}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Orders ({filteredOrders.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <LoadingSpinner size="lg" text="Loading orders..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">#{order.order_number}</div>
                        <div className="text-sm text-gray-500">
                          {order.order_items?.length || 0} items
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.shipping_address.firstName} {order.shipping_address.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{order.shipping_address.company}</div>
                        <div className="text-sm text-gray-500">{order.billing_address.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatPrice(order.total_amount)}</div>
                      <div className="text-sm text-gray-500">
                        Payment: {order.payment_status}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          className={`ml-2 text-xs px-2 py-1 rounded border-0 ${getStatusColor(order.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col gap-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(order)}
                            className="text-green-600 hover:text-green-900"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                        {/* Manual Tracking Entry */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenTrackingModal(order)}
                            className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 flex items-center gap-1"
                            title="Add/Edit Tracking"
                          >
                            <Truck className="h-3 w-3" />
                            {order.tracking_number ? 'Edit' : 'Add'} Tracking
                          </button>
                          {order.tracking_number && (
                            <span className="text-xs text-gray-600" title={`Carrier: ${order.carrier}`}>
                              {order.tracking_number}
                            </span>
                          )}
                        </div>
                        {/* ShipStation Actions */}
                        {order.shipstation_order_id && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleGetTracking(order.id)}
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 flex items-center gap-1"
                              title="Get Tracking from ShipStation"
                            >
                              <Package className="h-3 w-3" />
                              Sync ShipStation
                            </button>
                          </div>
                        )}
                        {!order.shipstation_order_id && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSyncToShipStation(order.id)}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 flex items-center gap-1"
                              title="Sync to ShipStation"
                            >
                              <Truck className="h-3 w-3" />
                              Sync to ShipStation
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setSelectedOrder(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order Details - #{selectedOrder.order_number}
                  </h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {selectedOrder.shipping_address.firstName} {selectedOrder.shipping_address.lastName}</div>
                      <div><strong>Company:</strong> {selectedOrder.shipping_address.company}</div>
                      <div><strong>Email:</strong> {selectedOrder.billing_address.email}</div>
                      <div><strong>Phone:</strong> {selectedOrder.shipping_address.phone}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Order Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Order Date:</strong> {formatDate(selectedOrder.created_at)}</div>
                      <div><strong>Status:</strong> {selectedOrder.status}</div>
                      <div><strong>Payment Status:</strong> {selectedOrder.payment_status}</div>
                      <div><strong>Shipping Method:</strong> {selectedOrder.shipping_method}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-sm text-gray-500">
                            SKU: {item.product_sku} | Size: {item.size} | Qty: {item.quantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatPrice(item.total_price)}</div>
                          <div className="text-sm text-gray-500">{formatPrice(item.unit_price)} each</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-600">Subtotal: {formatPrice(selectedOrder.subtotal)}</div>
                      <div className="text-sm text-gray-600">Shipping: {formatPrice(selectedOrder.shipping_cost)}</div>
                      <div className="text-sm text-gray-600">Tax: {formatPrice(selectedOrder.tax_amount)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        Total: {formatPrice(selectedOrder.total_amount)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tracking Information Modal */}
      {trackingModalOrder && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={handleCloseTrackingModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {trackingModalOrder.tracking_number ? 'Edit' : 'Add'} Tracking Information
                  </h3>
                  <button
                    onClick={handleCloseTrackingModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Order: <span className="font-medium">#{trackingModalOrder.order_number}</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carrier
                    </label>
                    <select
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select carrier</option>
                      <option value="USPS">USPS</option>
                      <option value="FedEx">FedEx</option>
                      <option value="UPS">UPS</option>
                      <option value="DHL">DHL</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={handleCloseTrackingModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateTracking}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Tracking Info
                  </button>
                </div>

                <p className="mt-4 text-xs text-gray-500">
                  Note: Saving tracking information will automatically update the order status to "shipped".
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}