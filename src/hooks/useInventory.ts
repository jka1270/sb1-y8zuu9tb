import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { cache, CACHE_KEYS } from '../lib/cache';

export interface InventoryItem {
  id: string;
  product_id: string;
  variant_id?: string;
  sku: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  reorder_point: number;
  max_stock: number;
  cost_per_unit: number;
  supplier_id?: string;
  batch_number?: string;
  expiry_date?: string;
  location: string;
  temperature_zone: string;
  last_restocked?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryTransaction {
  id: string;
  inventory_id: string;
  transaction_type: 'restock' | 'sale' | 'adjustment' | 'reservation' | 'return' | 'expired' | 'damaged';
  quantity_change: number;
  reference_id?: string;
  reason?: string;
  performed_by?: string;
  notes?: string;
  created_at: string;
}

export interface LowStockAlert {
  id: string;
  inventory_id: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired';
  threshold_value?: number;
  current_stock: number;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  created_at: string;
  inventory?: InventoryItem;
}

export const useInventory = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
    
    // Only fetch user-specific data if authenticated
    if (user) {
      fetchAlerts();
      fetchTransactions();
    }
    
    // Set up real-time subscriptions
    const inventorySubscription = supabase
      .channel('inventory_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'inventory' },
        () => fetchInventory()
      )
      .subscribe();

    // Only subscribe to alerts if user is authenticated
    let alertsSubscription;
    if (user) {
      alertsSubscription = supabase
        .channel('alerts_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'low_stock_alerts' },
          () => fetchAlerts()
        )
        .subscribe();
    }

    return () => {
      inventorySubscription.unsubscribe();
      if (alertsSubscription) {
        alertsSubscription.unsubscribe();
      }
    };
  }, [user]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      
      // Check cache first
      const cachedInventory = cache.get(CACHE_KEYS.INVENTORY);
      if (cachedInventory) {
        setInventory(cachedInventory);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('product_id', { ascending: true });

      if (error) throw error;
      setInventory(data || []);
      
      // Cache for 1 minute (inventory changes frequently)
      cache.set(CACHE_KEYS.INVENTORY, data || [], 60 * 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('low_stock_alerts')
        .select(`
          *,
          inventory (
            id,
            product_id,
            variant_id,
            sku,
            current_stock,
            reserved_stock,
            available_stock,
            reorder_point,
            max_stock,
            batch_number,
            expiry_date,
            location,
            temperature_zone
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAlerts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
    }
  };

  const fetchTransactions = async (limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    }
  };

  const getStockLevel = (sku: string): InventoryItem | null => {
    return inventory.find(item => item.sku === sku) || null;
  };

  const isInStock = (sku: string, quantity = 1): boolean => {
    const item = getStockLevel(sku);
    return item ? item.available_stock >= quantity : false;
  };

  const getLowStockItems = (): InventoryItem[] => {
    return inventory.filter(item => item.current_stock <= item.reorder_point);
  };

  const getOutOfStockItems = (): InventoryItem[] => {
    return inventory.filter(item => item.current_stock === 0);
  };

  const getExpiringItems = (days = 30): InventoryItem[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return inventory.filter(item => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      return expiryDate <= cutoffDate;
    });
  };

  const createTransaction = async (transaction: Omit<InventoryTransaction, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .insert(transaction)
        .select()
        .single();

      if (error) throw error;
      
      // Refresh data
      cache.delete(CACHE_KEYS.INVENTORY);
      await fetchInventory();
      await fetchTransactions();
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
      throw err;
    }
  };

  const acknowledgeAlert = async (alertId: string, userId?: string) => {
    try {
      const { error } = await supabase
        .from('low_stock_alerts')
        .update({
          status: 'acknowledged',
          acknowledged_by: userId,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
      await fetchAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge alert');
      throw err;
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('low_stock_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
      await fetchAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve alert');
      throw err;
    }
  };

  const reserveStock = async (sku: string, quantity: number, orderId?: string) => {
    const item = getStockLevel(sku);
    if (!item) throw new Error('Product not found in inventory');
    
    if (item.available_stock < quantity) {
      throw new Error('Insufficient stock available');
    }

    await createTransaction({
      inventory_id: item.id,
      transaction_type: 'reservation',
      quantity_change: quantity,
      reference_id: orderId,
      reason: 'Order reservation'
    });
  };

  const releaseReservation = async (sku: string, quantity: number, orderId?: string) => {
    const item = getStockLevel(sku);
    if (!item) throw new Error('Product not found in inventory');

    await createTransaction({
      inventory_id: item.id,
      transaction_type: 'reservation',
      quantity_change: -quantity,
      reference_id: orderId,
      reason: 'Release reservation'
    });
  };

  const processOrder = async (sku: string, quantity: number, orderId?: string) => {
    const item = getStockLevel(sku);
    if (!item) throw new Error('Product not found in inventory');

    await createTransaction({
      inventory_id: item.id,
      transaction_type: 'sale',
      quantity_change: quantity,
      reference_id: orderId,
      reason: 'Order fulfillment'
    });
  };

  return {
    inventory,
    alerts,
    transactions,
    loading,
    error,
    getStockLevel,
    isInStock,
    getLowStockItems,
    getOutOfStockItems,
    getExpiringItems,
    createTransaction,
    acknowledgeAlert,
    resolveAlert,
    reserveStock,
    releaseReservation,
    processOrder,
    refetch: fetchInventory
  };
};