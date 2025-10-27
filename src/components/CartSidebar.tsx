import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface CartSidebarProps {
  onCheckout: () => void;
}

export default function CartSidebar({ onCheckout }: CartSidebarProps) {
  const { state, removeItem, updateQuantity, closeCart, getTotalPrice } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleCheckout = () => {
    closeCart();
    onCheckout();
  };

  if (!state.isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeCart}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <div className="flex items-center">
            <ShoppingBag className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-lg sm:text-xl font-semibold">Shopping Cart</h2>
          </div>
          {getTotalPrice() >= 300 && (
            <div className="text-sm text-red-600 font-medium text-center">
              🎉 You qualify for FREE shipping!
            </div>
          )}
          {getTotalPrice() < 300 && (
            <div className="text-sm text-red-600 text-center">
              Add {formatPrice(300 - getTotalPrice())} more for FREE shipping
            </div>
          )}
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full touch-manipulation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {state.items.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-base sm:text-lg">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-2 px-4">Add some peptides to get started</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                        {item.productName}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Size: {item.size} | SKU: {item.sku}
                      </p>
                      <p className="text-xs sm:text-sm text-green-600">
                        Purity: {item.purity}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 gap-2">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 sm:p-2 hover:bg-gray-200 rounded touch-manipulation"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <span className="w-6 sm:w-8 text-center font-medium text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 sm:p-2 hover:bg-gray-200 rounded touch-manipulation"
                          >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end space-x-2">
                          <span className="font-semibold text-sm sm:text-base">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 sm:p-2 text-red-500 hover:bg-red-50 rounded touch-manipulation"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="border-t p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors touch-manipulation text-sm sm:text-base"
            >
              Proceed to Checkout
            </button>
            <p className="text-xs text-gray-500 text-center px-2">
              For research use only. Not for human consumption.
            </p>
          </div>
        )}
      </div>
    </>
  );
}