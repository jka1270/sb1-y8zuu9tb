import { useState } from 'react';
import { CreditCard, Lock, AlertTriangle, CheckCircle } from 'lucide-react';

interface PaymentProcessorProps {
  amount: number;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
  loading?: boolean;
}

interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export default function PaymentProcessor({ 
  amount, 
  onSuccess, 
  onError, 
  loading = false 
}: PaymentProcessorProps) {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!paymentData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    const cardNumber = paymentData.cardNumber.replace(/\s/g, '');
    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!paymentData.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }

    if (!paymentData.cvv || paymentData.cvv.length < 3 || paymentData.cvv.length > 4) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would integrate with Stripe or another payment processor
      const mockPaymentResult = {
        id: 'pay_' + Math.random().toString(36).substr(2, 9),
        status: 'succeeded',
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        payment_method: 'card',
        created: Date.now()
      };

      onSuccess(mockPaymentResult);
    } catch (error) {
      onError('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleInputChange = (field: keyof PaymentData, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    }

    setPaymentData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cardholder Name *
          </label>
          <input
            type="text"
            value={paymentData.cardholderName}
            onChange={(e) => handleInputChange('cardholderName', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.cardholderName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="John Doe"
            disabled={processing || loading}
          />
          {errors.cardholderName && (
            <p className="text-red-600 text-sm mt-1">{errors.cardholderName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number *
          </label>
          <input
            type="text"
            value={paymentData.cardNumber}
            onChange={(e) => handleInputChange('cardNumber', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.cardNumber ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            disabled={processing || loading}
          />
          {errors.cardNumber && (
            <p className="text-red-600 text-sm mt-1">{errors.cardNumber}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date *
            </label>
            <input
              type="text"
              value={paymentData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.expiryDate ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="MM/YY"
              maxLength={5}
              disabled={processing || loading}
            />
            {errors.expiryDate && (
              <p className="text-red-600 text-sm mt-1">{errors.expiryDate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV *
            </label>
            <input
              type="text"
              value={paymentData.cvv}
              onChange={(e) => handleInputChange('cvv', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.cvv ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="123"
              maxLength={4}
              disabled={processing || loading}
            />
            {errors.cvv && (
              <p className="text-red-600 text-sm mt-1">{errors.cvv}</p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-sm text-gray-600">
            <Lock className="h-4 w-4 mr-2" />
            <span>Your payment information is encrypted and secure</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={processing || loading}
          className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors ${
            processing || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {processing ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Pay {formatPrice(amount)}
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          By completing this payment, you agree to our terms of service and confirm 
          that these peptides are for research use only.
        </p>
      </div>
    </div>
  );
}