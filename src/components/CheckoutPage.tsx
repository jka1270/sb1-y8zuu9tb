import { useState } from 'react';
import { ArrowLeft, CreditCard, Truck, Shield, AlertTriangle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { useInventory } from '../hooks/useInventory';
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
  const { reserveStock, isInStock } = useInventory();
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
    country: 'United States',
    phone: '',
  });
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    ...shippingAddress,
    email: '',
  });
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
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

  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true);
      if (!user) {
        setAuthModalOpen(true);
        return;
      }

      // Check stock availability for all items
      for (const item of state.items) {
        if (!isInStock(item.sku, item.quantity)) {
          alert(`Insufficient stock for ${item.productName}. Please adjust your order.`);
          return;
        }
      }

      // Create order in database
      const orderData = {
        subtotal,
        shipping_cost: shippingCost,
        tax_amount: tax,
        total_amount: total,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
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
          molecular_weight: '1000 Da', // You might want to store this in cart items
        }))
      };

      await createOrder(orderData);
      
      // Reserve stock for ordered items
      for (const item of state.items) {
        await reserveStock(item.sku, item.quantity);
      }
      
      alert('Order placed successfully! Check your order history to track progress.');
      clearCart();
      onBack();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('There was an error placing your order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const steps = [
    { id: 1, name: 'Shipping', icon: Truck },
    { id: 2, name: 'Payment', icon: CreditCard },
    { id: 3, name: 'Review', icon: Shield },
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
                      onClick={() => setCurrentStep(2)}
                      className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 text-sm sm:text-base touch-manipulation"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Payment Information</h2>
                  
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
                            value="card"
                            checked={paymentMethod === 'card'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mr-3"
                          />
                          <CreditCard className="h-5 w-5 mr-2" />
                          <span className="text-sm sm:text-base">Credit/Debit Card</span>
                        </label>
                      </div>
                    </div>

                    {paymentMethod === 'card' && (
                      <PaymentProcessor
                        amount={total}
                        onSuccess={(paymentData) => {
                          console.log('Payment successful:', paymentData);
                          setCurrentStep(3);
                        }}
                        onError={(error) => {
                          alert(`Payment failed: ${error}`);
                        }}
                        loading={placingOrder}
                      />
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
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 text-sm sm:text-base touch-manipulation"
                    >
                      Review Order
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Review Your Order</h2>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="font-medium mb-3 text-sm sm:text-base">Order Items</h3>
                      <div className="space-y-3">
                        {state.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-medium text-sm sm:text-base truncate">{item.productName}</div>
                                <div className="text-xs sm:text-sm text-gray-600">
                                  {item.size} | Qty: {item.quantity}
                                </div>
                              </div>
                            </div>
                            <div className="font-semibold text-sm sm:text-base flex-shrink-0 ml-2">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3 text-sm sm:text-base">Shipping Address</h3>
                      <div className="p-3 sm:p-4 bg-gray-50 rounded-lg text-sm sm:text-base">
                        <div>{shippingAddress.firstName} {shippingAddress.lastName}</div>
                        <div>{shippingAddress.company}</div>
                        <div>{shippingAddress.address1}</div>
                        {shippingAddress.address2 && <div>{shippingAddress.address2}</div>}
                        <div>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</div>
                        <div>{shippingAddress.phone}</div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 p-3 sm:p-4 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                        <div className="text-xs sm:text-sm text-red-800">
                          <strong>Final Confirmation:</strong> I confirm that these peptides are for research use only and not for human consumption. I understand the terms and conditions of purchase.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between gap-3">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="border border-gray-300 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-50 text-sm sm:text-base touch-manipulation"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={placingOrder}
                      className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 text-sm sm:text-base touch-manipulation"
                    >
                      {placingOrder ? (
                        <div className="flex items-center">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Placing Order...
                        </div>
                      ) : (
                        'Place Order'
                      )}
                    </button>
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