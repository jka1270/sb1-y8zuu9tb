import { useState } from 'react';
import { ArrowLeft, Download, ShoppingCart, Heart, Share2, AlertTriangle, Thermometer, Clock, Shield, FileText, Beaker, Scale, BookOpen } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useCart } from '../contexts/CartContext';
import { useSavedProducts } from '../hooks/useSavedProducts';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useCOA } from '../hooks/useCOA';
import StockIndicator from './StockIndicator';
import COAViewer from './COAViewer';
import OptimizedImage from './OptimizedImage';
import LoadingSpinner from './LoadingSpinner';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
}

export default function ProductDetailPage({ product, onBack }: ProductDetailPageProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants ? product.variants[0] : null
  );
  const [activeTab, setActiveTab] = useState('overview');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addItem } = useCart();
  const { isProductSaved, saveProduct, unsaveProduct } = useSavedProducts();
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const { getCOABySKU } = useCOA();
  const [showCOA, setShowCOA] = useState(false);
  const [selectedCOA, setSelectedCOA] = useState<any>(null);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const productImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image];

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

  const availableCOAs = getCOABySKU(currentSku);

  const handleAddToCart = () => {
    setAddingToCart(true);
    const cartItem = {
      id: `${product.id}-${selectedVariant?.id || 'default'}`,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      variantId: selectedVariant?.id,
      size: selectedVariant?.size || 'Standard',
      price: currentPrice,
      quantity: quantity,
      sku: currentSku,
      purity: product.purity,
    };
    addItem(cartItem);
    setTimeout(() => setAddingToCart(false), 500); // Brief loading state
  };

  const handleToggleSave = async () => {
    if (!user) {
      showNotification({
        type: 'warning',
        message: 'Please log in to save products to your favorites',
        duration: 3000
      });
      return;
    }

    try {
      setSavingProduct(true);
      if (isSaved) {
        await unsaveProduct(product.id, selectedVariant?.id);
        showNotification({
          type: 'success',
          message: 'Product removed from favorites',
          duration: 3000
        });
      } else {
        await saveProduct({
          product_id: product.id,
          product_name: product.name,
          variant_id: selectedVariant?.id,
          priority: 'medium'
        });
        showNotification({
          type: 'success',
          message: 'Product added to favorites',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      if (error instanceof Error && error.message.includes('duplicate')) {
        showNotification({
          type: 'info',
          message: 'This product is already in your favorites',
          duration: 3000
        });
      } else {
        showNotification({
          type: 'error',
          message: 'Failed to update favorites',
          duration: 3000
        });
      }
    } finally {
      setSavingProduct(false);
    }
  };

  const handleViewCOA = (coa: any) => {
    setSelectedCOA(coa);
    setShowCOA(true);
  };

  const handleViewDocumentation = () => {
    setShowDocumentation(true);
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} - ${product.description}`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.href);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      }
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'specifications', label: 'Specifications', icon: Beaker },
    { id: 'storage', label: 'Storage & Handling', icon: Thermometer },
    { id: 'usage', label: 'Usage Guidelines', icon: Scale },
    { id: 'coa', label: 'Certificate of Analysis', icon: Shield },
    { id: 'documentation', label: 'Research Documentation', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Share Toast Notification */}
      {showShareToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in">
          <Share2 className="h-5 w-5" />
          <span>Link copied to clipboard!</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg shadow-md overflow-hidden">
              <OptimizedImage
                src={productImages[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
                priority={true}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-white rounded overflow-hidden transition-all ${
                      selectedImageIndex === index
                        ? 'border-2 border-blue-600 ring-2 ring-blue-200'
                        : 'border-2 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <OptimizedImage
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className={`w-full h-full object-cover transition-opacity ${
                        selectedImageIndex === index ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                      }`}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-600 font-medium">{product.category}</span>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleToggleSave}
                    disabled={savingProduct}
                    className={`p-2 hover:text-red-500 ${isSaved ? 'text-red-500' : 'text-gray-400'}`}
                  >
                    {savingProduct ? (
                      <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-red-500 rounded-full" />
                    ) : (
                      <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-400 hover:text-blue-500"
                    title="Share product"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600 text-lg">{product.description}</p>
            </div>

            {/* Key Specs */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Purity</span>
                  <p className="font-semibold text-green-600">{product.purity}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Molecular Weight</span>
                  <p className="font-semibold">{product.molecularWeight}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">SKU</span>
                  <p className="font-semibold">{currentSku}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Stock Status</span>
                  <StockIndicator sku={currentSku} showDetails={true} inStock={currentInStock} />
                </div>
              </div>
            </div>

            {/* Size Selection */}
            {product.variants && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Package Size:</label>
                <div className="grid grid-cols-3 gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 text-center rounded-lg border-2 transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                      }`}
                    >
                      <div className="font-semibold">{variant.size}</div>
                      <div className="text-sm">{formatPrice(variant.price)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price and Add to Cart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{formatPrice(currentPrice)}</div>
                  <div className="text-sm text-gray-500">Price per unit</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Quantity</div>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="border border-gray-300 rounded px-3 py-1 text-center"
                  >
                    {[1, 2, 3, 4, 5, 10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={!currentInStock || addingToCart}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-lg transition-colors ${
                  currentInStock && !addingToCart
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {addingToCart ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {currentInStock ? `Add ${quantity} to Cart` : 'Out of Stock'}
                  </>
                )}
              </button>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>For Research Only</strong> - Not for human consumption. This product is intended solely for laboratory research purposes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
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

          <div className="mt-8">
            {activeTab === 'overview' && (
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">Product Overview</h3>
                <p className="text-gray-600 mb-6">{product.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h4 className="font-semibold mb-3">Key Features</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• High purity research grade peptide</li>
                      <li>• Lyophilized powder for stability</li>
                      <li>• Third-party tested and verified</li>
                      <li>• Certificate of Analysis included</li>
                      <li>• Cold chain shipping available</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h4 className="font-semibold mb-3">Applications</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Cellular research studies</li>
                      <li>• Biochemical assays</li>
                      <li>• Protein interaction studies</li>
                      <li>• Pharmacological research</li>
                      <li>• Academic research projects</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-xl font-semibold mb-6">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h4 className="font-semibold mb-4">Chemical Properties</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Molecular Weight:</span>
                        <span className="font-medium">{product.molecularWeight}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Purity:</span>
                        <span className="font-medium text-green-600">{product.purity}</span>
                      </div>
                      {product.sequence && (
                        <div>
                          <span className="text-gray-600">Sequence:</span>
                          <p className="font-mono text-sm mt-1 p-2 bg-gray-50 rounded">{product.sequence}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h4 className="font-semibold mb-4">Additional Specifications</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Purity:</span>
                        <span className="font-medium text-green-600">{product.purity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Molecular Weight:</span>
                        <span className="font-medium">{product.molecularWeight !== '0' && product.molecularWeight !== 'N/A' ? product.molecularWeight : 'Contact for details'}</span>
                      </div>
                      {product.sequence && product.sequence !== 'N/A' && (
                        <div>
                          <span className="text-gray-600">Sequence:</span>
                          <p className="font-mono text-sm mt-1 p-2 bg-gray-50 rounded">{product.sequence}</p>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Storage:</span>
                        <span className="font-medium">-20°C</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'storage' && (
              <div>
                <h3 className="text-xl font-semibold mb-6">Storage & Handling Instructions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <Thermometer className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Temperature</h4>
                    <p className="text-gray-600">Store at -20°C for long-term stability</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Shelf Life</h4>
                    <p className="text-gray-600">2-3 years when stored properly</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Protection</h4>
                    <p className="text-gray-600">Keep away from light and moisture</p>
                  </div>
                </div>

                <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
                  <h4 className="font-semibold mb-4">Detailed Storage Guidelines</h4>
                  <div className="space-y-4 text-gray-600">
                    <div>
                      <strong>Lyophilized Powder:</strong>
                      <ul className="mt-2 ml-4 space-y-1">
                        <li>• Store at -20°C in original sealed vial</li>
                        <li>• Protect from light and moisture</li>
                        <li>• Allow to reach room temperature before opening</li>
                        <li>• Use desiccant packets if available</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Reconstituted Solution:</strong>
                      <ul className="mt-2 ml-4 space-y-1">
                        <li>• Store at 2-8°C for short-term use (up to 1 week)</li>
                        <li>• For longer storage, aliquot and freeze at -20°C</li>
                        <li>• Avoid repeated freeze-thaw cycles</li>
                        <li>• Use sterile technique when handling</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'usage' && (
              <div>
                <h3 className="text-xl font-semibold mb-6">Usage Guidelines</h3>
                
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                    <div className="text-red-800">
                      <strong>Important:</strong> This product is for research use only. Not for human or animal consumption. Handle with appropriate safety equipment.
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h4 className="font-semibold mb-4">Reconstitution</h4>
                    <div className="space-y-3 text-gray-600">
                      <p><strong>Solvent:</strong> Use sterile water, bacteriostatic water, or appropriate buffer</p>
                      <p><strong>Concentration:</strong> Typically 1-10 mg/mL depending on application</p>
                      <p><strong>Method:</strong> Add solvent slowly to the side of the vial, avoid direct contact with powder</p>
                      <p><strong>Mixing:</strong> Gently swirl or vortex briefly, do not shake vigorously</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h4 className="font-semibold mb-4">Safety Precautions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ul className="space-y-2 text-gray-600">
                        <li>• Wear appropriate PPE (gloves, lab coat, safety glasses)</li>
                        <li>• Work in a well-ventilated area or fume hood</li>
                        <li>• Avoid skin and eye contact</li>
                        <li>• Do not inhale powder or aerosols</li>
                      </ul>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Use sterile technique when handling</li>
                        <li>• Dispose of waste according to local regulations</li>
                        <li>• Keep detailed records of usage</li>
                        <li>• Store away from food and beverages</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h4 className="font-semibold mb-4">Typical Research Applications</h4>
                    <div className="text-gray-600">
                      <p className="mb-3">This peptide is commonly used in:</p>
                      <ul className="space-y-1 ml-4">
                        <li>• Cell culture experiments</li>
                        <li>• Biochemical assays</li>
                        <li>• Protein-protein interaction studies</li>
                        <li>• Pharmacological research</li>
                        <li>• Academic research projects</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'coa' && (
              <div>
                <h3 className="text-xl font-semibold mb-6">Certificate of Analysis</h3>
                
                {availableCOAs.length > 0 ? (
                  <div className="space-y-4">
                    {availableCOAs.map((coa) => (
                      <div key={coa.id} className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold">Batch: {coa.batch_number}</h4>
                            <p className="text-gray-600">
                              Manufacturing Date: {new Date(coa.manufacturing_date).toLocaleDateString()}
                            </p>
                            <p className="text-gray-600">
                              Analysis Date: {new Date(coa.analysis_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewCOA(coa)}
                              className="flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Details
                            </button>
                            <button 
                              onClick={() => handleViewCOA(coa)}
                              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h5 className="font-medium mb-3">Purity Analysis</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>HPLC Purity:</span>
                                <span className="font-medium text-green-600">{coa.purity_hplc}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Mass Spectrometry:</span>
                                <span className="font-medium">{coa.purity_ms}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Water Content:</span>
                                <span className="font-medium">{coa.water_content}%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-medium mb-3">Quality Control</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Analyst:</span>
                                <span className="font-medium">{coa.analyst_name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Approved By:</span>
                                <span className="font-medium">{coa.qc_approved_by}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Status:</span>
                                <span className={`font-medium ${
                                  coa.specifications_met ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {coa.specifications_met ? 'Passed' : 'Failed'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium mb-3">Molecular Weight</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Found:</span>
                                <span className="font-medium">{coa.molecular_weight_found} Da</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Expected:</span>
                                <span className="font-medium">{coa.molecular_weight_expected} Da</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No COA Available</h3>
                    <p className="text-gray-600">
                      Certificate of Analysis will be available once this batch is manufactured and tested.
                    </p>
                  </div>
                )}

                <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
                  <h4 className="font-semibold mb-4">Quality Assurance Process</h4>
                  <div className="text-gray-600 space-y-2">
                    <p>✓ Manufactured under GMP conditions</p>
                    <p>✓ Third-party tested for purity and identity</p>
                    <p>✓ Comprehensive analytical testing (HPLC, MS, microbiology)</p>
                    <p>✓ Stored and shipped under appropriate conditions</p>
                    <p>✓ Full traceability from synthesis to delivery</p>
                    <p>✓ Certificate of Analysis provided with each batch</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documentation' && (
              <div>
                <h3 className="text-xl font-semibold mb-6">Research Documentation</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Technical Data Sheet</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Complete chemical and physical properties, analytical methods, and specifications
                    </p>
                    <button
                      onClick={() => setShowDocumentation(true)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                      View TDS
                    </button>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Safety Data Sheet</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Comprehensive safety information, hazard classification, and emergency procedures
                    </p>
                    <button
                      onClick={() => setShowDocumentation(true)}
                      className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                    >
                      View SDS
                    </button>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <BookOpen className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Research Protocols</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Step-by-step research procedures, methods, and experimental guidelines
                    </p>
                    <button
                      onClick={() => setShowDocumentation(true)}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                    >
                      View Protocols
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h4 className="font-semibold mb-4">Available Documentation</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <div className="font-medium text-blue-900">Technical Specifications</div>
                          <div className="text-sm text-blue-700">Chemical properties, analytical methods, storage guidelines</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowDocumentation(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Download PDF
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-red-600 mr-3" />
                        <div>
                          <div className="font-medium text-red-900">Safety Information</div>
                          <div className="text-sm text-red-700">Hazard classification, first aid, handling precautions</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowDocumentation(true)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Download PDF
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                          <div className="font-medium text-green-900">Research Protocols</div>
                          <div className="text-sm text-green-700">Experimental procedures, methods, troubleshooting</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowDocumentation(true)}
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        View Protocols
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div className="text-yellow-800">
                      <strong>Documentation Notice:</strong> All research documentation is provided for informational purposes only. 
                      Always follow your institution's protocols and safety guidelines when conducting research.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COA Viewer Modal */}
      {showCOA && selectedCOA && (
        <COAViewer 
          coa={selectedCOA} 
          onClose={() => setShowCOA(false)} 
        />
      )}

      {/* Documentation Page Modal */}
      {showDocumentation && (
        <div className="fixed inset-0 bg-white z-50">
          <div className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <button
                onClick={() => setShowDocumentation(false)}
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Product
              </button>
            </div>
          </div>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Research Documentation</h2>
            <p className="text-gray-600 mb-6">Documentation for {product.name}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Technical Data Sheet</h3>
                <p className="text-gray-600 text-sm mb-4">Complete specifications and properties</p>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Download TDS
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Safety Data Sheet</h3>
                <p className="text-gray-600 text-sm mb-4">Safety information and handling</p>
                <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">
                  Download SDS
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                <BookOpen className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Research Protocols</h3>
                <p className="text-gray-600 text-sm mb-4">Experimental procedures</p>
                <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                  View Protocols
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}