import { useState } from 'react';
import { Users, Package, ShoppingBag, BarChart3, Search, Filter, Plus, Pencil, Trash2, Eye, Download, RefreshCw, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, MessageSquare, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserRole } from '../hooks/useUserRole';
import { useOrders } from '../hooks/useOrders';
import AdminProductManager from './AdminProductManager';
import AdminOrderManager from './AdminOrderManager';
import AdminCustomerManager from './AdminCustomerManager';
import AdminDashboard from './AdminDashboard';
import AdminMessagesManager from './AdminMessagesManager';
import AdminDocumentManager from './AdminDocumentManager';
import LoadingSpinner from './LoadingSpinner';

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking permissions..." />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.email?.split('@')[0]}
              </span>
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'products' && <AdminProductManager />}
          {activeTab === 'orders' && <AdminOrderManager />}
          {activeTab === 'customers' && <AdminCustomerManager />}
          {activeTab === 'documents' && <AdminDocumentManager />}
          {activeTab === 'messages' && <AdminMessagesManager />}
        </div>
      </div>
    </div>
  );
}