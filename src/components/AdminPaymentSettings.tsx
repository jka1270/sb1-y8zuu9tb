import { useState, useEffect } from 'react';
import { DollarSign, Save, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from './LoadingSpinner';

interface PaymentSettings {
  id: string;
  cod_enabled: boolean;
  updated_at: string;
}

export default function AdminPaymentSettings() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
      } else {
        const { data: newData, error: insertError } = await supabase
          .from('payment_settings')
          .insert({ cod_enabled: true })
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newData);
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      setMessage({ type: 'error', text: 'Failed to load payment settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCOD = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const newCodEnabled = !settings.cod_enabled;

      const { error } = await supabase
        .from('payment_settings')
        .update({ cod_enabled: newCodEnabled })
        .eq('id', settings.id);

      if (error) throw error;

      setSettings({ ...settings, cod_enabled: newCodEnabled });
      setMessage({
        type: 'success',
        text: `Cash on Delivery ${newCodEnabled ? 'enabled' : 'disabled'} successfully`,
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating payment settings:', error);
      setMessage({ type: 'error', text: 'Failed to update payment settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" text="Loading payment settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <DollarSign className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Payment Settings</h2>
        </div>
        <button
          onClick={fetchSettings}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Methods</h3>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center">
                <h4 className="text-base font-semibold text-gray-900">Cash on Delivery (COD)</h4>
                <span
                  className={`ml-3 px-2 py-1 text-xs font-semibold rounded-full ${
                    settings?.cod_enabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {settings?.cod_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Allow customers to pay with cash when their order is delivered
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={settings?.cod_enabled || false}
                onChange={handleToggleCOD}
                disabled={saving}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex-1">
              <div className="flex items-center">
                <h4 className="text-base font-semibold text-gray-900">Credit/Debit Card</h4>
                <span className="ml-3 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Enabled
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Accept payments via StratosPay payment gateway
              </p>
            </div>

            <div className="ml-4 text-sm text-gray-500">
              Always enabled
            </div>
          </div>
        </div>

        {settings && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last updated: {new Date(settings.updated_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">Payment Method Information</h3>
            <div className="mt-2 text-sm text-blue-800">
              <ul className="list-disc list-inside space-y-1">
                <li>COD can be enabled or disabled based on your business requirements</li>
                <li>Card payments through StratosPay are always available</li>
                <li>Changes take effect immediately for new orders</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
