import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Pencil, Mail, Phone, Building, Calendar, Package, DollarSign, Download, RefreshCw, Users, Shield, Clock, FileText, CheckCircle, XCircle, GraduationCap, Award } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { supabase } from '../lib/supabase';
import LoadingSpinner from './LoadingSpinner';

interface ResearchProfile {
  institution_type: string;
  research_areas: string[];
  position_title: string;
  department: string;
  supervisor_name?: string;
  supervisor_email?: string;
  years_experience: number;
  education_level: string;
  specializations: string[];
  publications_count: number;
  orcid_id?: string;
  research_interests?: string;
  current_projects?: string;
  funding_sources: string[];
  ethics_training_completed: boolean;
  ethics_training_date?: string;
  safety_training_completed: boolean;
  safety_training_date?: string;
  institutional_approval: boolean;
  approval_document_url?: string;
  verification_status: string;
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
}

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
  research_profile?: ResearchProfile;
}

export default function AdminCustomerManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Get all user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get all research profiles
      const { data: researchProfiles, error: researchError } = await supabase
        .from('research_profiles')
        .select('*');

      if (researchError && researchError.code !== 'PGRST116') {
        console.error('Error fetching research profiles:', researchError);
      }

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

        // Find research profile
        const researchProfile = researchProfiles?.find(rp => rp.user_id === profile.id);

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
          verification_status: profile.is_admin ? 'admin' : (researchProfile?.verification_status || 'none'),
          research_profile: researchProfile || undefined
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

  const handleApproveVerification = async (userId: string) => {
    if (!confirm('Are you sure you want to approve this research profile?')) return;

    setProcessingAction(true);
    try {
      const { error } = await supabase
        .from('research_profiles')
        .update({
          verification_status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      await fetchCustomers();
      setSelectedCustomer(null);
      alert('Research profile approved successfully!');
    } catch (error) {
      console.error('Error approving verification:', error);
      alert('Failed to approve verification. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectVerification = async (userId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    setProcessingAction(true);
    try {
      const { error } = await supabase
        .from('research_profiles')
        .update({
          verification_status: 'rejected',
          rejection_reason: reason,
          verified_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      await fetchCustomers();
      setSelectedCustomer(null);
      alert('Research profile rejected.');
    } catch (error) {
      console.error('Error rejecting verification:', error);
      alert('Failed to reject verification. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleViewDocument = async (documentPath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('research_documents')
        .createSignedUrl(documentPath, 3600);

      if (error) throw error;

      setDocumentUrl(data.signedUrl);
      setShowDocumentViewer(true);
    } catch (error) {
      console.error('Error loading document:', error);
      alert('Failed to load document. Please try again.');
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

                {/* Research Profile Section */}
                {selectedCustomer.research_profile && (
                  <div className="mt-8 pt-6 border-t">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2" />
                      Research Profile
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Information */}
                      <div className="space-y-3">
                        <h5 className="text-sm font-semibold text-gray-700">Institution Details</h5>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Type:</span> {selectedCustomer.research_profile.institution_type}</p>
                          <p><span className="font-medium">Position:</span> {selectedCustomer.research_profile.position_title}</p>
                          <p><span className="font-medium">Department:</span> {selectedCustomer.research_profile.department}</p>
                          <p><span className="font-medium">Education:</span> {selectedCustomer.research_profile.education_level}</p>
                          <p><span className="font-medium">Experience:</span> {selectedCustomer.research_profile.years_experience} years</p>
                          {selectedCustomer.research_profile.publications_count > 0 && (
                            <p><span className="font-medium">Publications:</span> {selectedCustomer.research_profile.publications_count}</p>
                          )}
                        </div>
                      </div>

                      {/* Research Details */}
                      <div className="space-y-3">
                        <h5 className="text-sm font-semibold text-gray-700">Research Focus</h5>
                        <div className="space-y-2 text-sm">
                          {selectedCustomer.research_profile.research_areas.length > 0 && (
                            <div>
                              <span className="font-medium">Areas:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedCustomer.research_profile.research_areas.map((area, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                    {area}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedCustomer.research_profile.specializations.length > 0 && (
                            <div>
                              <span className="font-medium">Specializations:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedCustomer.research_profile.specializations.map((spec, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedCustomer.research_profile.funding_sources.length > 0 && (
                            <div>
                              <span className="font-medium">Funding:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedCustomer.research_profile.funding_sources.map((source, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                                    {source}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Compliance & Training */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <Award className="h-4 w-4 mr-2" />
                        Compliance & Training
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          {selectedCustomer.research_profile.ethics_training_completed ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span>Ethics Training</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedCustomer.research_profile.safety_training_completed ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span>Safety Training</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedCustomer.research_profile.institutional_approval ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span>Institutional Approval</span>
                        </div>
                      </div>

                      {selectedCustomer.research_profile.approval_document_url && (
                        <div className="mt-4">
                          <button
                            onClick={() => handleViewDocument(selectedCustomer.research_profile!.approval_document_url!)}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                          >
                            <FileText className="h-4 w-4" />
                            <span>View Approval Document</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {selectedCustomer.research_profile.rejection_reason && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                        <p className="text-sm text-red-700 mt-1">{selectedCustomer.research_profile.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Close
                    </button>
                    {selectedCustomer.research_profile && selectedCustomer.verification_status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleRejectVerification(selectedCustomer.id)}
                          disabled={processingAction}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>{processingAction ? 'Processing...' : 'Reject'}</span>
                        </button>
                        <button
                          onClick={() => handleApproveVerification(selectedCustomer.id)}
                          disabled={processingAction}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>{processingAction ? 'Processing...' : 'Approve'}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Document Viewer Modal */}
      {showDocumentViewer && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[60]" onClick={() => setShowDocumentViewer(false)} />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Approval Document</h3>
                <button
                  onClick={() => setShowDocumentViewer(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
                <iframe
                  src={documentUrl}
                  className="w-full h-[70vh] border-0"
                  title="Approval Document"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}