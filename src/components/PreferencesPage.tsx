import { useState } from 'react';
import { ArrowLeft, Settings, Bell, Lock, Mail, Shield, Eye, EyeOff } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

interface PreferencesPageProps {
  onBack: () => void;
}

export default function PreferencesPage({ onBack }: PreferencesPageProps) {
  const { showNotification } = useNotification();

  const [emailNotifications, setEmailNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    researchUpdates: true,
    securityAlerts: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    showProfile: false,
    shareResearch: false,
    dataCollection: true,
  });

  const handleSaveNotifications = () => {
    showNotification({
      type: 'success',
      message: 'Notification preferences updated',
      duration: 3000,
    });
  };

  const handleSavePrivacy = () => {
    showNotification({
      type: 'success',
      message: 'Privacy settings updated',
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-8 border-b border-gray-200">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-blue-600 mr-4" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Preferences</h1>
                  <p className="text-gray-600 mt-1">Manage your notification and privacy settings</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-gray-400" />
                Email Notifications
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <h3 className="font-medium text-gray-900">Order Updates</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 ml-6">
                      Receive notifications about order status changes and shipping updates
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={emailNotifications.orderUpdates}
                      onChange={(e) => setEmailNotifications({ ...emailNotifications, orderUpdates: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Bell className="h-4 w-4 text-gray-400 mr-2" />
                      <h3 className="font-medium text-gray-900">Promotions & Offers</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 ml-6">
                      Get updates about special offers, discounts, and new products
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={emailNotifications.promotions}
                      onChange={(e) => setEmailNotifications({ ...emailNotifications, promotions: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-gray-400 mr-2" />
                      <h3 className="font-medium text-gray-900">Research Updates</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 ml-6">
                      Receive updates about new research documentation and guides
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={emailNotifications.researchUpdates}
                      onChange={(e) => setEmailNotifications({ ...emailNotifications, researchUpdates: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 text-gray-400 mr-2" />
                      <h3 className="font-medium text-gray-900">Security Alerts</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 ml-6">
                      Important notifications about account security and login activity
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={emailNotifications.securityAlerts}
                      onChange={(e) => setEmailNotifications({ ...emailNotifications, securityAlerts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveNotifications}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Notification Preferences
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-8 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Lock className="h-5 w-5 mr-2 text-gray-400" />
                Privacy Settings
              </h2>
            </div>

            <div className="px-6 py-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 text-gray-400 mr-2" />
                      <h3 className="font-medium text-gray-900">Public Profile</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 ml-6">
                      Allow other researchers to view your profile
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={privacySettings.showProfile}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, showProfile: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-gray-400 mr-2" />
                      <h3 className="font-medium text-gray-900">Share Research Data</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 ml-6">
                      Allow your research findings to be shared with the community
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={privacySettings.shareResearch}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, shareResearch: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <EyeOff className="h-4 w-4 text-gray-400 mr-2" />
                      <h3 className="font-medium text-gray-900">Usage Analytics</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 ml-6">
                      Help us improve by sharing anonymous usage data
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={privacySettings.dataCollection}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, dataCollection: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSavePrivacy}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Privacy Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
