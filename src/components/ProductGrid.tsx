import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import ProductDetailPage from './ProductDetailPage';
import CategoryFilter from './CategoryFilter';
import AdvancedFilters, { FilterState } from './AdvancedFilters';
import { Search } from 'lucide-react';
import { Product } from '../types';
import InventoryAlertsBanner from './InventoryAlertsBanner';
import LoadingSpinner from './LoadingSpinner';
import { useImagePreloader } from '../hooks/useImagePreloader';
import { useDebounce } from '../hooks/useDebounce';
import { supabase } from '../lib/supabase';

interface ProductGridProps {
  initialCategory?: string;
}

export default function ProductGrid({ initialCategory = '' }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    purityRange: [90, 100],
    priceRange: [0, 1000],
    molecularWeightRange: [0, 10000],
    inStockOnly: false,
    applications: [],
    storageTemp: [],
    sortBy: 'name',
    sortOrder: 'asc'
  });

  useEffect(() => {
    setSelectedCategory(initialCategory);
    setFilters(prev => ({ ...prev, category: initialCategory }));
  }, [initialCategory]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      const formattedProducts: Product[] = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description || '',
        price: Number(p.price),
        image: p.images && p.images.length > 0 ? p.images[0] : '',
        images: p.images || [],
        specifications: {
          'Purity': p.purity || '≥99%',
          'Molecular Weight': p.molecular_weight || 'N/A',
          'Sequence': p.sequence || 'N/A',
          'Storage': '-20°C'
        },
        inStock: p.in_stock,
        sku: p.sku,
        purity: p.purity || '≥99%',
        molecularWeight: p.molecular_weight || '0',
        sequence: p.sequence || ''
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Preload product images for better performance
  const productImages = products.map(p => p.image);
  const { isLoading: imagesLoading } = useImagePreloader(productImages);

  // Debounce search term to reduce filtering operations
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredProducts = products.filter(product => {
    const categoryToMatch = filters.category || selectedCategory;
    const matchesCategory = categoryToMatch === '' || product.category === categoryToMatch;
    const matchesSearch = product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    
    // Parse purity percentage
    const purityValue = parseFloat(product.purity.replace(/[≥%]/g, ''));
    const matchesPurity = purityValue >= filters.purityRange[0] && purityValue <= filters.purityRange[1];
    
    // Parse molecular weight
    const molecularWeight = parseFloat(product.molecularWeight.replace(/[^\d.]/g, ''));
    const matchesMolecularWeight = molecularWeight >= filters.molecularWeightRange[0] && 
                                   molecularWeight <= filters.molecularWeightRange[1];
    
    // Check price range
    const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
    
    // Check stock status
    const matchesStock = !filters.inStockOnly || product.inStock;
    
    // Check applications (simplified - in real app you'd have application data)
    const matchesApplications = filters.applications.length === 0 || 
                                filters.applications.some(app => 
                                  product.description.toLowerCase().includes(app.toLowerCase()) ||
                                  product.category.toLowerCase().includes(app.toLowerCase())
                                );
    
    // Check storage temperature (simplified - in real app you'd have storage data)
    const matchesStorageTemp = filters.storageTemp.length === 0 ||
                               filters.storageTemp.some(temp =>
                                 product.specifications['Storage']?.includes(temp) ||
                                 (temp === '-20°C' && product.specifications['Storage']?.includes('-20'))
                               );
    
    return matchesCategory && matchesSearch && matchesPurity && matchesMolecularWeight && 
           matchesPrice && matchesStock && matchesApplications && matchesStorageTemp;
  });

  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (filters.sortBy) {
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'purity':
        aValue = parseFloat(a.purity.replace(/[≥%]/g, ''));
        bValue = parseFloat(b.purity.replace(/[≥%]/g, ''));
        break;
      case 'molecularWeight':
        aValue = parseFloat(a.molecularWeight.replace(/[^\d.]/g, ''));
        bValue = parseFloat(b.molecularWeight.replace(/[^\d.]/g, ''));
        break;
      case 'category':
        aValue = a.category;
        bValue = b.category;
        break;
      default: // name
        aValue = a.name;
        bValue = b.name;
    }
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (filters.sortOrder === 'desc') {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    } else {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }
  });

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleBackToGrid = () => {
    setSelectedProduct(null);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Update category filter to match advanced filter
    setSelectedCategory(newFilters.category);
  };

  const handleClearFilters = () => {
    setFilters({
      category: initialCategory,
      purityRange: [90, 100],
      priceRange: [0, 1000],
      molecularWeightRange: [0, 10000],
      inStockOnly: false,
      applications: [],
      storageTemp: [],
      sortBy: 'name',
      sortOrder: 'asc'
    });
    setSelectedCategory(initialCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setFilters(prev => ({ ...prev, category }));
  };

  if (selectedProduct) {
    return <ProductDetailPage product={selectedProduct} onBack={handleBackToGrid} />;
  }

  // Show loading state while fetching products
  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 px-4">Research Peptide Catalog</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Explore our comprehensive selection of high-purity peptides for therapeutic, cosmetic, and research applications
          </p>
        </div>
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" text="Loading peptide catalog..." />
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Inventory Alerts Banner */}
      <InventoryAlertsBanner />
      
      {/* Free Shipping Notice */}
      <div className="flex justify-center mb-6">
        <span className="font-bold text-sm sm:text-base text-red-600 blink-box">
          Free shipping orders over $300.00
        </span>
      </div>
      
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 px-4">Research Peptide Catalog</h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Explore our comprehensive selection of high-purity peptides for therapeutic, cosmetic, and research applications
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-sm sm:max-w-md mx-auto mb-6 sm:mb-8 px-4 sm:px-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search peptides..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      <AdvancedFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Results Count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2 px-4 sm:px-0">
        <p className="text-sm sm:text-base text-gray-600">
          Showing {sortedProducts.length} of {products.length} peptides
        </p>
        <div className="text-xs sm:text-sm text-gray-500">
          Sorted by {filters.sortBy} ({filters.sortOrder === 'asc' ? 'ascending' : 'descending'})
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-0">
        {sortedProducts.map(product => (
          <ProductCard key={product.id} product={product} onViewDetails={handleViewDetails} />
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <div className="text-center py-12 sm:py-16 px-4">
          <p className="text-gray-500 text-lg sm:text-xl">No peptides found matching your criteria.</p>
          <button
            onClick={handleClearFilters}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium touch-manipulation"
          >
            Clear all filters
          </button>
        </div>
      )}

    </section>
  );
}