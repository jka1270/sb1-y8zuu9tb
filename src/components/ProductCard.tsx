import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useSavedProducts } from '../hooks/useSavedProducts';
import StockIndicator from './StockIndicator';
import OptimizedImage from './OptimizedImage';
import LoadingSpinner from './LoadingSpinner';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants ? product.variants[0] : null
  );
  const [isBlinking, setIsBlinking] = useState(false);
  const { addItem } = useCart();
  const { isProductSaved, saveProduct, unsaveProduct } = useSavedProducts();
  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;
  const currentInStock = selectedVariant ? selectedVariant.inStock : product.inStock;
  const isSaved = isProductSaved(product.id, selectedVariant?.id);
<<<<<<< HEAD
=======
  const productImage = (product.images && product.images.length > 0) ? product.images[0] : product.image;
>>>>>>> c7bfe8dc5fa8f702766366e53572fdd68007ce3d

  const handleAddToCart = () => {
    // Trigger blink animation
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 600); // Match animation duration
    
    const cartItem = {
      id: `${product.id}-${selectedVariant?.id || 'default'}`,
      productId: product.id,
      productName: product.name,
<<<<<<< HEAD
      productImage: product.image,
=======
      productImage: productImage,
>>>>>>> c7bfe8dc5fa8f702766366e53572fdd68007ce3d
      variantId: selectedVariant?.id,
      size: selectedVariant?.size || 'Standard',
      price: currentPrice,
      quantity: 1,
      sku: currentSku,
      purity: product.purity,
    };
    addItem(cartItem);
  };

  const handleToggleSave = async () => {
    try {
      setIsLoading(true);
      if (isSaved) {
        await unsaveProduct(product.id, selectedVariant?.id);
      } else {
        await saveProduct({
          product_id: product.id,
          product_name: product.name,
          variant_id: selectedVariant?.id,
          priority: 'medium'
        });
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group touch-manipulation">
<<<<<<< HEAD
      <div className="relative overflow-hidden">
        <OptimizedImage
          src={product.image} 
=======
      <div className="relative overflow-hidden cursor-pointer" onClick={() => onViewDetails(product)}>
        <OptimizedImage
          src={productImage}
>>>>>>> c7bfe8dc5fa8f702766366e53572fdd68007ce3d
          alt={product.name}
          className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
<<<<<<< HEAD
          <button 
            onClick={handleToggleSave}
=======
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleSave();
            }}
>>>>>>> c7bfe8dc5fa8f702766366e53572fdd68007ce3d
            disabled={isLoading}
            className={`bg-white p-2 sm:p-3 rounded-full shadow-md hover:bg-gray-50 touch-manipulation ${isSaved ? 'text-red-500' : 'text-gray-600'}`}
          >
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
            ) : (
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            )}
          </button>
<<<<<<< HEAD
          <button 
            onClick={() => onViewDetails(product)}
=======
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
>>>>>>> c7bfe8dc5fa8f702766366e53572fdd68007ce3d
            className="bg-white p-2 sm:p-3 rounded-full shadow-md hover:bg-gray-50 touch-manipulation"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        {!product.inStock && (
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-red-500 text-white px-2 py-1 rounded text-xs sm:text-sm font-medium">
            Out of Stock
          </div>
        )}
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
          <span className="text-xs sm:text-sm text-blue-600 font-medium">{product.category}</span>
          <span className="text-xs sm:text-sm text-gray-500">SKU: {currentSku}</span>
        </div>
        
        <h3 
          className="text-base sm:text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors cursor-pointer leading-tight"
          onClick={() => onViewDetails(product)}
        >
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        
        {/* Size Selection for variants */}
        {product.variants && (
          <div className="mb-4">
            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">Size:</label>
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md border transition-colors touch-manipulation ${
                    selectedVariant?.id === variant.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                  }`}
                >
                  {variant.size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {formatPrice(currentPrice)}
          </div>
          <div className="text-xs sm:text-sm text-green-600 font-medium mb-2">
            Purity: {product.purity} | MW: {product.molecularWeight}
          </div>
          
          {/* Stock Indicator */}
          <div className="mb-3">
<<<<<<< HEAD
            <StockIndicator sku={currentSku} showDetails={false} />
=======
            <StockIndicator sku={currentSku} showDetails={false} inStock={currentInStock} />
>>>>>>> c7bfe8dc5fa8f702766366e53572fdd68007ce3d
          </div>
          
          {Object.entries(product.specifications).slice(0, 2).map(([key, value]) => (
            <div key={key} className="text-xs text-gray-500 flex justify-between mb-1">
              <span>{key}:</span>
              <span className="text-right">{value}</span>
            </div>
          ))}
        </div>
        
        <button 
          onClick={handleAddToCart}
          disabled={!currentInStock}
          className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-semibold transition-colors touch-manipulation text-sm sm:text-base ${
            isBlinking ? 'blink-animation' : ''
          } ${
            currentInStock
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {currentInStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}