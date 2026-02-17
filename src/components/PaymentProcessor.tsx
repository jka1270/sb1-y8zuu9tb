import { useState } from 'react';
import { CreditCard, Lock, Loader2 } from 'lucide-react';

interface PaymentProcessorProps {
  amount: number;
  customerEmail: string;
  customerFirstName?: string;
  customerLastName?: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
  loading?: boolean;
  externalReference: string;
}

export default function PaymentProcessor({
  amount,
  customerEmail,
  customerFirstName = '',
  customerLastName = '',
  onSuccess,
  onError,
  loading = false,
  externalReference
}: PaymentProcessorProps) {
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handlePayment = async () => {
    setProcessing(true);
    setPaymentError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const amountInCents = Math.round(amount * 100);

      const response = await fetch(
        `${supabaseUrl}/functions/v1/stratospay-charge`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountInCents,
            currency: 'USD',
            customer: {
              first_name: customerFirstName || 'Customer',
              last_name: customerLastName || '',
              email: customerEmail,
            },
            external_reference: externalReference,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment processing failed');
      }

      if (data.status === 'onchain' || data.data?.status === 'onchain') {
        onSuccess({
          id: data.data?.external_reference || externalReference,
          status: 'succeeded',
          amount: amountInCents,
          currency: 'usd',
          payment_method: 'stratospay',
          created: Date.now(),
          external_reference: data.data?.external_reference,
          stratospay_data: data.data,
        });
      } else {
        throw new Error('Payment is not in expected status');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      setPaymentError(errorMsg);
      onError(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-6">
        <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
        <Lock className="h-4 w-4 text-gray-400 ml-auto" />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <span className="text-blue-900 font-medium">Total Amount:</span>
          <span className="text-2xl font-bold text-blue-900">{formatPrice(amount)}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="text-gray-900 font-medium">
                {customerFirstName} {customerLastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="text-gray-900 font-medium">{customerEmail}</span>
            </div>
          </div>
        </div>

        {paymentError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
                <p className="mt-1 text-sm text-red-700">{paymentError}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={processing || loading}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {processing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="h-5 w-5 mr-2" />
              Complete Payment
            </>
          )}
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <div className="flex items-center text-sm text-gray-600">
          <Lock className="h-4 w-4 mr-2" />
          <span>Payments processed securely via StratosPay</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          By completing this payment, you agree to our terms of service and confirm
          that these amino acid chains are for research use only.
        </p>
      </div>
    </div>
  );
}
