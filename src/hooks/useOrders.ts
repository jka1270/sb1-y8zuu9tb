import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { cache, CACHE_KEYS } from '../lib/cache';

export interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  shipping_address: any;
  billing_address: any;
  shipping_method: string;
  payment_method: string;
  payment_status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  tracking_number?: string;
  carrier?: string;
  shipped_at?: string;
  shipstation_order_id?: string;
  shipstation_status?: string;
  shipstation_synced_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  variant_id?: string;
  size: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  purity: string;
  molecular_weight: string;
  created_at: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async (skipCache = false) => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = `${CACHE_KEYS.ORDERS}_${user?.id}`;

      // Check cache first (unless skipCache is true)
      if (!skipCache) {
        const cachedOrders = cache.get(cacheKey);
        if (cachedOrders) {
          setOrders(cachedOrders);
          setLoading(false);
          return;
        }
      } else {
        // Clear cache when skipCache is true
        cache.delete(cacheKey);
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setOrders(ordersData || []);

      // Cache the results
      cache.set(cacheKey, ordersData || [], 2 * 60 * 1000); // 2 minutes
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: {
    subtotal: number;
    shipping_cost: number;
    tax_amount: number;
    total_amount: number;
    shipping_address: any;
    billing_address: any;
    shipping_method: string;
    payment_method: string;
    payment_status?: string;
    payment_transaction_id?: string;
    items: Array<{
      product_id: string;
      product_name: string;
      product_sku: string;
      variant_id?: string;
      size: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      purity: string;
      molecular_weight: string;
    }>;
  }) => {
    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      // Create order (support both authenticated and guest checkout)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          order_number: orderNumber,
          subtotal: orderData.subtotal,
          shipping_cost: orderData.shipping_cost,
          tax_amount: orderData.tax_amount,
          total_amount: orderData.total_amount,
          shipping_address: orderData.shipping_address,
          billing_address: orderData.billing_address,
          shipping_method: orderData.shipping_method,
          payment_method: orderData.payment_method,
          payment_status: orderData.payment_status || 'pending',
          payment_transaction_id: orderData.payment_transaction_id,
          status: 'processing'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        ...item
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw itemsError;
      }

      // Refresh orders
      cache.delete(`${CACHE_KEYS.ORDERS}_${user?.id}`);
      await fetchOrders();

      return order;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      cache.delete(`${CACHE_KEYS.ORDERS}_${user?.id}`);
      await fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
      throw err;
    }
  };

  const syncToShipStation = async (orderId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shipstation-integration?action=create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to sync to ShipStation');
      }

      cache.delete(`${CACHE_KEYS.ORDERS}_${user?.id}`);
      await fetchOrders();

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync to ShipStation';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getTracking = async (orderId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shipstation-integration?action=tracking&orderId=${orderId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get tracking info');
      }

      cache.delete(`${CACHE_KEYS.ORDERS}_${user?.id}`);
      await fetchOrders();

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get tracking info';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    syncToShipStation,
    getTracking,
    refetch: () => fetchOrders(true)
  };
};