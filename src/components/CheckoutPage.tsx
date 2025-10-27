import { useState } from 'react';
import { ArrowLeft, CreditCard, Truck, Shield, AlertTriangle, Banknote } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { ShippingAddress, BillingAddress } from '../types';
import AuthModal from './AuthModal';
import PaymentProcessor from './PaymentProcessor';
import LoadingSpinner from './LoadingSpinner';

interface CheckoutPageProps {
  onBack: () => void;
}

export default function CheckoutPage({ onBack }: CheckoutPageProps) {
  const { state, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const [currentStep, setCurrentStep] = useState(1);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
  });
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    ...shippingAddress,
    email: '',
  });
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Pre-fill form with user data if logged in
  useState(() => {
    if (user && user.user_metadata) {
      setShippingAddress(prev => ({
        ...prev,
        firstName: user.user_metadata.first_name || '',
        lastName: user.user_metadata.last_name || '',
        company: user.user_metadata.company || '',
        phone: user.user_metadata.phone || '',
      }));
      setBillingAddress(prev => ({
        ...prev,
        email: user.email || '',
        firstName: user.user_metadata.first_name || '',
        lastName: user.user_metadata.last_name || '',
        company: user.user_metadata.company || '',
        phone: user.user_metadata.phone || '',
      }));
    }
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const subtotal = getTotalPrice();
  const baseShippingCost = shippingMethod === 'express' ? 89.99 : 49.99;
  const shippingCost = subtotal >= 300 ? 0 : baseShippingCost;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shippingCost + tax;

  const steps = [
    { id: 1, name: 'Shipping', icon: Truck },
    { id: 2, name: 'Payment', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Guest Checkout Notice */}
            {!user && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-blue-900 text-sm sm:text-base">Sign in for faster checkout</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Save your information and track your orders
                    </p>
                  </div>
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base touch-manipulation"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between overflow-x-auto pb-2">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <div key={step.id} className="flex items-center flex-shrink-0">
                      <div
                        className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : isCompleted
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`ml-1 sm:ml-2 font-medium text-xs sm:text-sm ${
                          isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                        }`}
                      >
                        {step.name}
                      </span>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                            isCompleted ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              {currentStep === 1 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Shipping Information</h2>
                  
                  {/* Research Disclaimer */}
                  <div className="bg-yellow-50 border border-yellow-200 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                      <div className="text-xs sm:text-sm text-yellow-800">
                        <strong>Research Use Only:</strong> By proceeding with this order, you confirm that these peptides are for research purposes only and not for human consumption.
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.firstName}
                        onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.lastName}
                        onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company/Institution *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.company}
                        onChange={(e) => setShippingAddress({...shippingAddress, company: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.address1}
                        onChange={(e) => setShippingAddress({...shippingAddress, address1: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.address2}
                        onChange={(e) => setShippingAddress({...shippingAddress, address2: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <select
                        required
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="IT">Italy</option>
                        <option value="ES">Spain</option>
                        <option value="NL">Netherlands</option>
                        <option value="SE">Sweden</option>
                        <option value="CH">Switzerland</option>
                        <option value="JP">Japan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <div className="mt-8">
                    <h3 className="text-base sm:text-lg font-medium mb-4">Shipping Method</h3>
                    <div className="space-y-3">
                      <label className="flex items-start sm:items-center p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-gray-50 touch-manipulation">
                        <input
                          type="radio"
                          name="shipping"
                          value="standard"
                          checked={shippingMethod === 'standard'}
                          onChange={(e) => setShippingMethod(e.target.value)}
                          className="mr-3 mt-1 sm:mt-0 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm sm:text-base">Standard Cold Chain Shipping</div>
                          <div className="text-xs sm:text-sm text-gray-600">5-7 business days - Temperature controlled</div>
                        </div>
                        <div className="font-semibold text-sm sm:text-base">$49.99</div>
                      </label>
                      <label className="flex items-start sm:items-center p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-gray-50 touch-manipulation">
                        <input
                          type="radio"
                          name="shipping"
                          value="express"
                          checked={shippingMethod === 'express'}
                          onChange={(e) => setShippingMethod(e.target.value)}
                          className="mr-3 mt-1 sm:mt-0 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm sm:text-base">Express Cold Chain Shipping</div>
                          <div className="text-xs sm:text-sm text-gray-600">1-2 business days - Temperature controlled</div>
                        </div>
                        <div className="font-semibold text-sm sm:text-base">$89.99</div>
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8 flex justify-end">
                    <button
                      onClick={() => {
                        const requiredFields = [
                          shippingAddress.firstName,
                          shippingAddress.lastName,
                          shippingAddress.company,
                          shippingAddress.address1,
                          shippingAddress.city,
                          shippingAddress.state,
                          shippingAddress.zipCode,
                          shippingAddress.country,
                          shippingAddress.phone
                        ];

                        if (requiredFields.some(field => !field || field.trim() === '')) {
                          alert('Please fill in all required fields');
                          return;
                        }

                        setCurrentStep(2);
                      }}
                      className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 text-sm sm:text-base touch-manipulation"
                    >
                      Continue to Review
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Review & Payment</h2>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={billingAddress.email}
                        onChange={(e) => setBillingAddress({...billingAddress, email: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-medium mb-4">Payment Method</h3>
                      <div className="space-y-3">
                        <label className="flex items-center p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-gray-50 touch-manipulation">
                          <input
                            type="radio"
                            name="payment"
                            value="stratospay"
                            checked={paymentMethod === 'stratospay'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mr-3"
                          />
                          <CreditCard className="h-5 w-5 mr-2" />
                          <span className="text-sm sm:text-base">Credit Card (StratosPay)</span>
                        </label>
                        <label className="flex items-center p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-gray-50 touch-manipulation">
                          <input
                            type="radio"
                            name="payment"
                            value="cod"
                            checked={paymentMethod === 'cod'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mr-3"
                          />
                          <Banknote className="h-5 w-5 mr-2" />
                          <span className="text-sm sm:text-base">Cash on Delivery</span>
                        </label>
                      </div>
                    </div>

                    {paymentMethod === 'stratospay' && billingAddress.email && (
                      <PaymentProcessor
                        amount={total}
                        customerEmail={billingAddress.email}
                        customerFirstName={billingAddress.firstName || shippingAddress.firstName}
                        customerLastName={billingAddress.lastName || shippingAddress.lastName}
                        externalReference={`ORDER-${Date.now()}`}
                        onSuccess={async (paymentData) => {
                          try {
                            setPlacingOrder(true);

                            const orderData = {
                              subtotal,
                              shipping_cost: shippingCost,
                              tax_amount: tax,
                              total_amount: total,
                              shipping_address: shippingAddress,
                              billing_address: billingAddress,
                              shipping_method: shippingMethod,
                              payment_method: 'stratospay',
                              payment_status: 'paid',
                              stratospay_transaction_id: paymentData.id,
                              stratospay_reference: paymentData.external_reference,
                              items: state.items.map(item => ({
                                product_id: item.productId,
                                product_name: item.productName,
                                product_sku: item.sku,
                                variant_id: item.variantId,
                                size: item.size,
                                quantity: item.quantity,
                                unit_price: item.price,
                                total_price: item.price * item.quantity,
                                purity: item.purity,
                                molecular_weight: '1000 Da',
                              }))
                            };

                            await createOrder(orderData);

                            alert('Payment successful! Your order has been placed. Check your order history to track progress.');
                            clearCart();
                            onBack();
                          } catch (error) {
                            console.error('Error creating order:', error);
                            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                            alert(`Payment successful but failed to create order: ${errorMessage}\n\nPlease contact support with transaction ID: ${paymentData.id}`);
                          } finally {
                            setPlacingOrder(false);
                          }
                        }}
                        onError={(error) => {
                          alert(`Payment failed: ${error}`);
                        }}
                        loading={placingOrder}
                      />
                    )}

                    {paymentMethod === 'cod' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <Banknote className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-blue-900 mb-2">Cash on Delivery</h4>
                            <p className="text-sm text-blue-800">
                              Pay with cash when your order is delivered to your doorstep. Our delivery partner will collect the payment at the time of delivery.
                            </p>
                            <ul className="mt-3 space-y-1 text-sm text-blue-800">
                              <li>• Please keep exact change ready</li>
                              <li>• Payment must be made in cash only</li>
                              <li>• You can inspect the package before payment</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {!billingAddress.email && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                        <p className="text-sm text-yellow-800">
                          Please enter your email address to proceed with your order.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={sameAsShipping}
                          onChange={(e) => setSameAsShipping(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Billing address same as shipping</span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between gap-3">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="border border-gray-300 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-50 text-sm sm:text-base touch-manipulation"
                    >
                      Back
                    </button>
                    {paymentMethod === 'cod' && billingAddress.email && (
                      <button
                        onClick={async () => {
                          try {
                            setPlacingOrder(true);

                            const orderData = {
                              subtotal,
                              shipping_cost: shippingCost,
                              tax_amount: tax,
                              total_amount: total,
                              shipping_address: shippingAddress,
                              billing_address: billingAddress,
                              shipping_method: shippingMethod,
                              payment_method: 'cod',
                              payment_status: 'pending',
                              items: state.items.map(item => ({
                                product_id: item.productId,
                                product_name: item.productName,
                                product_sku: item.sku,
                                variant_id: item.variantId,
                                size: item.size,
                                quantity: item.quantity,
                                unit_price: item.price,
                                total_price: item.price * item.quantity,
                                purity: item.purity,
                                molecular_weight: '1000 Da',
                              }))
                            };

                            await createOrder(orderData);

                            alert('Order placed successfully! You will pay cash when your order is delivered. Check your order history to track progress.');
                            clearCart();
                            onBack();
                          } catch (error) {
                            console.error('Error creating order:', error);
                            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                            alert(`Failed to place order: ${errorMessage}\n\nPlease try again or contact support.`);
                          } finally {
                            setPlacingOrder(false);
                          }
                        }}
                        disabled={placingOrder}
                        className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base touch-manipulation flex items-center justify-center"
                      >
                        {placingOrder ? (
                          <>
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Placing Order...
                          </>
                        ) : (
                          'Place Order'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-4 sm:top-8">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Shipping:</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Tax:</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-base sm:text-lg font-semibold">
                    <span>Total:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 p-3 bg-blue-50 rounded-lg">
                <div className="text-xs sm:text-sm text-blue-800">
                  <strong>Cold Chain Shipping:</strong> All peptides are shipped with temperature monitoring to ensure product integrity.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}