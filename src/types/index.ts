export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  specifications: Record<string, string>;
  inStock: boolean;
  sku: string;
  purity: string;
  molecularWeight: string;
  sequence?: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  size: string;
  price: number;
  sku: string;
  inStock: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
}

export interface StorageInfo {
  temperature: string;
  stability: string;
  shelfLife: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  variantId?: string;
  size: string;
  price: number;
  quantity: number;
  sku: string;
  purity: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface BillingAddress extends ShippingAddress {
  email: string;
}

export interface ResearchDocument {
  id: string;
  title: string;
  type: 'tds' | 'sds' | 'protocol';
  productId: string;
  version: string;
  downloadUrl?: string;
  lastUpdated: string;
}
