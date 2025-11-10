import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { cache, CACHE_KEYS } from '../lib/cache';

export interface SavedProduct {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  variant_id?: string;
  research_notes?: string;
  tags: string[];
  priority: string;
  planned_use?: string;
  quantity_needed?: number;
  budget_allocated?: number;
  project_association?: string;
  saved_at: string;
  last_viewed: string;
}

export interface ProductList {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  list_type: string;
  project_name?: string;
  project_code?: string;
  budget_limit?: number;
  is_shared: boolean;
  share_token?: string;
  created_at: string;
  updated_at: string;
  items?: ProductListItem[];
}

export interface ProductListItem {
  id: string;
  list_id: string;
  product_id: string;
  product_name: string;
  variant_id?: string;
  quantity: number;
  notes?: string;
  priority: number;
  added_at: string;
}

export const useSavedProducts = () => {
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [productLists, setProductLists] = useState<ProductList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSavedProducts();
      fetchProductLists();
    } else {
      setSavedProducts([]);
      setProductLists([]);
      setLoading(false);
    }
  }, [user]);

  const fetchSavedProducts = async () => {
    try {
      setLoading(true);
      
      // Check cache first
      const cacheKey = `${CACHE_KEYS.SAVED_PRODUCTS}_${user?.id}`;
      const cachedProducts = cache.get(cacheKey);
      if (cachedProducts) {
        setSavedProducts(cachedProducts);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('saved_products')
        .select('*')
        .order('saved_at', { ascending: false });

      if (error) throw error;

      setSavedProducts(data || []);
      
      // Cache for 5 minutes
      cache.set(cacheKey, data || [], 5 * 60 * 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch saved products');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductLists = async () => {
    try {
      const { data, error } = await supabase
        .from('product_lists')
        .select(`
          *,
          product_list_items (*)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setProductLists(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product lists');
    }
  };

  const saveProduct = async (productData: {
    product_id: string;
    product_name: string;
    variant_id?: string;
    research_notes?: string;
    tags?: string[];
    priority?: string;
    planned_use?: string;
    quantity_needed?: number;
    budget_allocated?: number;
    project_association?: string;
  }) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Check if product is already saved
      const isAlreadySaved = isProductSaved(productData.product_id, productData.variant_id);
      if (isAlreadySaved) {
        throw new Error('Product already saved - duplicate key');
      }

      const { data, error } = await supabase
        .from('saved_products')
        .insert({
          user_id: user.id,
          ...productData,
          tags: productData.tags || [],
          priority: productData.priority || 'medium',
          last_viewed: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const cacheKey = `${CACHE_KEYS.SAVED_PRODUCTS}_${user.id}`;
      cache.delete(cacheKey);
      await fetchSavedProducts();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
      throw err;
    }
  };

  const unsaveProduct = async (productId: string, variantId?: string) => {
    try {
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('saved_products')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (variantId) {
        query = query.eq('variant_id', variantId);
      } else {
        query = query.is('variant_id', null);
      }

      const { error } = await query;

      if (error) throw error;

      const cacheKey = `${CACHE_KEYS.SAVED_PRODUCTS}_${user.id}`;
      cache.delete(cacheKey);
      await fetchSavedProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsave product');
      throw err;
    }
  };

  const updateSavedProduct = async (id: string, updates: Partial<SavedProduct>) => {
    try {
      const { data, error } = await supabase
        .from('saved_products')
        .update({
          ...updates,
          last_viewed: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const cacheKey = `${CACHE_KEYS.SAVED_PRODUCTS}_${user.id}`;
      cache.delete(cacheKey);
      await fetchSavedProducts();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update saved product');
      throw err;
    }
  };

  const createProductList = async (listData: {
    name: string;
    description?: string;
    list_type?: string;
    project_name?: string;
    project_code?: string;
    budget_limit?: number;
  }) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('product_lists')
        .insert({
          user_id: user.id,
          ...listData,
          list_type: listData.list_type || 'custom'
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProductLists();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product list');
      throw err;
    }
  };

  const addToProductList = async (listId: string, productData: {
    product_id: string;
    product_name: string;
    variant_id?: string;
    quantity?: number;
    notes?: string;
    priority?: number;
  }) => {
    try {
      const { data, error } = await supabase
        .from('product_list_items')
        .upsert({
          list_id: listId,
          ...productData,
          quantity: productData.quantity || 1,
          priority: productData.priority || 0
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProductLists();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product to list');
      throw err;
    }
  };

  const removeFromProductList = async (listId: string, productId: string, variantId?: string) => {
    try {
      let query = supabase
        .from('product_list_items')
        .delete()
        .eq('list_id', listId)
        .eq('product_id', productId);

      if (variantId) {
        query = query.eq('variant_id', variantId);
      } else {
        query = query.is('variant_id', null);
      }

      const { error } = await query;

      if (error) throw error;

      await fetchProductLists();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove product from list');
      throw err;
    }
  };

  const deleteProductList = async (listId: string) => {
    try {
      const { error } = await supabase
        .from('product_lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;

      await fetchProductLists();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product list');
      throw err;
    }
  };

  const isProductSaved = (productId: string, variantId?: string): boolean => {
    return savedProducts.some(saved => 
      saved.product_id === productId && 
      saved.variant_id === variantId
    );
  };

  const getSavedProduct = (productId: string, variantId?: string): SavedProduct | undefined => {
    return savedProducts.find(saved => 
      saved.product_id === productId && 
      saved.variant_id === variantId
    );
  };

  return {
    savedProducts,
    productLists,
    loading,
    error,
    saveProduct,
    unsaveProduct,
    updateSavedProduct,
    createProductList,
    addToProductList,
    removeFromProductList,
    deleteProductList,
    isProductSaved,
    getSavedProduct,
    refetch: () => {
      fetchSavedProducts();
      fetchProductLists();
    }
  };
};