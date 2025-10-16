import { useState } from 'react';
import { User, FileText, Heart, Settings, Shield, Package, BarChart3, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useResearchProfile } from '../hooks/useResearchProfile';
import { useSavedProducts } from '../hooks/useSavedProducts';
import { useOrders } from '../hooks/useOrders';

interface AccountDashboardProps {
  onNavigate: (page: string) => void;
}

export default function AccountDashboard({ onNavigate }: AccountDashboardProps) {
  const { user, signOut } = useAuth();
  const { profile: userProfile } = useUserProfile();
  const { profile: researchProfile } = useResearchProfile();
  const { savedProducts, productLists } = useSavedProducts();
  const { orders } = useOrders();

  const recentOrders = orders.slice(0, 3);
  const recentSavedProducts = savedProducts.slice(0, 4);

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userProfile?.first_name || user?.email?.split('@')[0]}
              </h1>
              <p className="text-gray-600 mt-1">
                {userProfile?.company && `${userProfile.company} • `}
                Member since {new Date(user?.created_at || '').toLocaleDateString()}
              </p>
            </div>
            {researchProfile && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getVerificationStatusColor(researchProfile.verification_status)}`}>
                {researchProfile.verification_status === 'verified' ? '✓ Verified Researcher' : 
                 researchProfile.verification_status === 'pending' ? 'Verification Pending' : 
                 'Verification Required'}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(totalSpent)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Saved Products</p>
                <p className="text-2xl font-bold text-gray-900">{savedProducts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Product Lists</p>
                <p className="text-2xl font-bold text-gray-900">{productLists.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => onNavigate('profile')}
                  className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Edit Profile</div>
                    <div className="text-sm text-gray-500">Update your account information</div>
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('research-profile')}
                  className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Shield className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Research Profile</div>
                    <div className="text-sm text-gray-500">
                      {researchProfile ? 'Update research information' : 'Complete verification'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('saved-products')}
                  className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Heart className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Saved Products</div>
                    <div className="text-sm text-gray-500">Manage your saved peptides</div>
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('order-history')}
                  className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Package className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Order History</div>
                    <div className="text-sm text-gray-500">View past orders and tracking</div>
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('preferences')}
                  className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Settings className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Preferences</div>
                    <div className="text-sm text-gray-500">Notification and privacy settings</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Research Profile Status */}
            {!researchProfile && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-start">
                  <Bell className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-900">Complete Your Research Profile</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Complete your research profile to access specialized peptides and features.
                    </p>
                    <button
                      onClick={() => onNavigate('research-profile')}
                      className="mt-2 text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      Complete Profile →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <button
                  onClick={() => onNavigate('order-history')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No orders yet</p>
                  <p className="text-sm text-gray-400">Your recent orders will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Order #{order.order_number}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()} • {order.status}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{formatPrice(order.total_amount)}</div>
                        <div className={`text-sm px-2 py-1 rounded ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recently Saved Products */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recently Saved</h2>
                <button
                  onClick={() => onNavigate('saved-products')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              
              {recentSavedProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No saved products yet</p>
                  <p className="text-sm text-gray-400">Save peptides while browsing to see them here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentSavedProducts.map((saved) => (
                    <div key={saved.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{saved.product_name}</div>
                        <div className="text-xs text-gray-500">
                          Saved {new Date(saved.saved_at).toLocaleDateString()}
                        </div>
                        {saved.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {saved.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                            {saved.tags.length > 2 && (
                              <span className="text-xs text-gray-400">+{saved.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <Heart className="h-4 w-4 text-red-500 ml-2" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}