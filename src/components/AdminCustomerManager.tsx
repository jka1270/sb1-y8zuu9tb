import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Pencil, Mail, Phone, Building, Calendar, Package, DollarSign, Download, RefreshCw, Users, Shield, Clock } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { supabase } from '../lib/supabase';
import LoadingSpinner from './LoadingSpinner';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  phone: string;
  created_at: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  verification_status?: string;
}

export default function AdminCustomerManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Get all user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get order statistics for each user
      const { data: orderStats, error: orderStatsError } = await supabase
        .from('orders')
        .select('user_id, total_amount, created_at')
        .order('created_at', { ascending: false });

      if (orderStatsError) throw orderStatsError;

      // Get emails from auth.users
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

      if (usersError) {
        console.warn('Could not fetch user emails:', usersError);
      }

      // Combine data
      const customersData: Customer[] = profiles?.map(profile => {
        const userOrders = orderStats?.filter(order => order.user_id === profile.id) || [];
        const totalOrders = userOrders.length;
        const totalSpent = userOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
        const lastOrderDate = userOrders.length > 0 ? userOrders[0].created_at : undefined;

        // Find email from auth users
        const authUser = users?.find(u => u.id === profile.id);
        const email = authUser?.email || 'N/A';

        return {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: email,
          company: profile.company,
          phone: profile.phone,
          created_at: profile.created_at,
          total_orders: totalOrders,
          total_spent: totalSpent,
          last_order_date: lastOrderDate,
          verification_status: profile.is_admin ? 'admin' : 'verified'
        };
      }) || [];

      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVerification = !verificationFilter || customer.verification_status === verificationFilter;
    return matchesSearch && matchesVerification;
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
      day: 'numeric'
    });
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const customerStats = {
    total: customers.length,
    verified: customers.filter(c => c.verification_status === 'verified').length,
    pending: customers.filter(c => c.verification_status === 'pending').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.total_spent, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
            <p className="text-gray-600">Manage customer accounts and research profiles</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchCustomers}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <div className="text-lg font-bold text-blue-900">{customerStats.total}</div>
                <div className="text-sm text-blue-700">Total Customers</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <div className="text-lg font-bold text-green-900">{customerStats.verified}</div>
                <div className="text-sm text-green-700">Verified</div>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-yellow-600" />
              <div className="ml-3">
                <div className="text-lg font-bold text-yellow-900">{customerStats.pending}</div>
                <div className="text-sm text-yellow-700">Pending Review</div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
              <div className="ml-3">
                <div className="text-lg font-bold text-purple-900">{formatPrice(customerStats.totalRevenue)}</div>
                <div className="text-sm text-purple-700">Total Revenue</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Verification Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <button
              onClick={() => {
                setSearchTerm('');
                setVerificationFilter('');
              }}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Customers ({filteredCustomers.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <LoadingSpinner size="lg" text="Loading customers..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
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
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4">
                          {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {customer.first_name} {customer.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(customer.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer.total_orders}</div>
                      {customer.last_order_date && (
                        <div className="text-sm text-gray-500">
                          Last: {formatDate(customer.last_order_date)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(customer.total_spent)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        getVerificationColor(customer.verification_status || 'pending')
                      }`}>
                        {customer.verification_status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setSelectedCustomer(customer)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Mail className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setSelectedCustomer(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Customer Details
                  </h3>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-3" />
                        <span>{selectedCustomer.first_name} {selectedCustomer.last_name}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-3" />
                        <span>{selectedCustomer.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-3" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-3" />
                        <span>{selectedCustomer.company}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                        <span>Member since {formatDate(selectedCustomer.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Order History</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 text-gray-400 mr-3" />
                        <span>{selectedCustomer.total_orders} total orders</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-3" />
                        <span>{formatPrice(selectedCustomer.total_spent)} total spent</span>
                      </div>
                      {selectedCustomer.last_order_date && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                          <span>Last order: {formatDate(selectedCustomer.last_order_date)}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-gray-400 mr-3" />
                        <span className={`px-2 py-1 rounded text-xs ${getVerificationColor(selectedCustomer.verification_status || 'pending')}`}>
                          {selectedCustomer.verification_status || 'pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-end space-x-3">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                      View Orders
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Send Message
                    </button>
                    {selectedCustomer.verification_status === 'pending' && (
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Approve Verification
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}