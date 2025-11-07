import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Plus, Trash2, Pencil, Search, Filter, Tag, Star, List, Grid2x2 as Grid } from 'lucide-react';
import { useSavedProducts } from '../hooks/useSavedProducts';
import { useNotification } from '../contexts/NotificationContext';
import { products } from '../data/products';
import { Product } from '../types';
import LoadingSpinner from './LoadingSpinner';
import OptimizedImage from './OptimizedImage';

interface SavedProductsPageProps {
  onBack: () => void;
}

export default function SavedProductsPage({ onBack }: SavedProductsPageProps) {
  const { showNotification } = useNotification();
  const {
    savedProducts,
    productLists,
    loading,
    error,
    unsaveProduct,
    updateSavedProduct,
    createProductList,
    addToProductList,
    removeFromProductList,
    deleteProductList
  } = useSavedProducts();

  const [activeTab, setActiveTab] = useState('saved');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getProductDetails = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const filteredSavedProducts = savedProducts.filter(saved => {
    const matchesSearch = saved.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         saved.research_notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !selectedPriority || saved.priority === selectedPriority;
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => saved.tags.includes(tag));
    
    return matchesSearch && matchesPriority && matchesTags;
  });

  const allTags = Array.from(new Set(savedProducts.flatMap(p => p.tags)));
  const priorities = ['low', 'medium', 'high', 'urgent'];

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    
    try {
      await createProductList({
        name: newListName,
        description: newListDescription,
        list_type: 'custom'
      });
      setShowNewListModal(false);
      setNewListName('');
      setNewListDescription('');
    } catch (err) {
      showNotification({
        type: 'error',
        message: 'Failed to create list',
        duration: 5000
      });
    }
  };

  const handleUpdateProduct = async (productId: string, updates: any) => {
    try {
      await updateSavedProduct(productId, updates);
      setEditingProduct(null);
    } catch (err) {
      showNotification({
        type: 'error',
        message: 'Failed to update product',
        duration: 5000
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading saved products..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Account
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setShowNewListModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New List
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Products & Lists</h1>
          <p className="text-gray-600">
            Organize your research peptides and create custom collections for your projects
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('saved')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'saved'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Heart className="h-4 w-4 mr-2" />
                Saved Products ({savedProducts.length})
              </button>
              <button
                onClick={() => setActiveTab('lists')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'lists'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <List className="h-4 w-4 mr-2" />
                Product Lists ({productLists.length})
              </button>
            </nav>
          </div>

          {/* Filters */}
          {activeTab === 'saved' && (
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search saved products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Priorities</option>
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    multiple
                    value={selectedTags}
                    onChange={(e) => setSelectedTags(Array.from(e.target.selectedOptions, option => option.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedPriority('');
                      setSelectedTags([]);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {activeTab === 'saved' && (
          <div>
            {filteredSavedProducts.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No saved products</h3>
                <p className="text-gray-600">
                  Start browsing peptides and save them for easy access later
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredSavedProducts.map((saved) => {
                  const product = getProductDetails(saved.product_id);
                  
                  return (
                    <div key={saved.id} className={`bg-white rounded-lg shadow-sm border ${viewMode === 'list' ? 'p-4' : 'overflow-hidden'}`}>
                      {viewMode === 'grid' ? (
                        <>
                          <div className="relative">
                           <OptimizedImage
                              src={product?.image || 'https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg?auto=compress&cs=tinysrgb&w=600'}
                              alt={saved.product_name}
                              className="w-full h-48 object-cover"
                             loading="lazy"
                             sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                            <div className="absolute top-2 right-2 flex space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(saved.priority)}`}>
                                {saved.priority}
                              </span>
                              <button
                                onClick={() => unsaveProduct(saved.product_id, saved.variant_id)}
                                className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">{saved.product_name}</h3>
                            {product && (
                              <p className="text-lg font-bold text-blue-600 mb-2">
                                {formatPrice(product.price)}
                              </p>
                            )}
                            {saved.research_notes && (
                              <p className="text-sm text-gray-600 mb-3">{saved.research_notes}</p>
                            )}
                            {saved.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {saved.tags.map((tag, index) => (
                                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex justify-between items-center text-sm text-gray-500">
                              <span>Saved {new Date(saved.saved_at).toLocaleDateString()}</span>
                              <button
                                onClick={() => setEditingProduct(saved.id)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center space-x-4">
                          <OptimizedImage
                            src={product?.image || 'https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg?auto=compress&cs=tinysrgb&w=600'}
                            alt={saved.product_name}
                            className="w-16 h-16 object-cover rounded"
                            loading="lazy"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{saved.product_name}</h3>
                            {product && (
                              <p className="text-blue-600 font-medium">{formatPrice(product.price)}</p>
                            )}
                            {saved.research_notes && (
                              <p className="text-sm text-gray-600 mt-1">{saved.research_notes}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(saved.priority)}`}>
                              {saved.priority}
                            </span>
                            <button
                              onClick={() => setEditingProduct(saved.id)}
                              className="p-1 text-gray-400 hover:text-blue-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => unsaveProduct(saved.product_id, saved.variant_id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'lists' && (
          <div>
            {productLists.length === 0 ? (
              <div className="text-center py-16">
                <List className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No product lists</h3>
                <p className="text-gray-600 mb-6">
                  Create custom lists to organize peptides by project or research area
                </p>
                <button
                  onClick={() => setShowNewListModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Your First List
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productLists.map((list) => (
                  <div key={list.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{list.name}</h3>
                        {list.description && (
                          <p className="text-sm text-gray-600">{list.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteProductList(list.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{list.items?.length || 0} items</span>
                      <span>{new Date(list.created_at).toLocaleDateString()}</span>
                    </div>

                    {list.project_name && (
                      <div className="mb-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          Project: {list.project_name}
                        </span>
                      </div>
                    )}

                    <button className="w-full text-blue-600 hover:text-blue-700 font-medium">
                      View List
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* New List Modal */}
      {showNewListModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowNewListModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New List</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      List Name *
                    </label>
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Cancer Research Project"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newListDescription}
                      onChange={(e) => setNewListDescription(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Optional description..."
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowNewListModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateList}
                    disabled={!newListName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Create List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}