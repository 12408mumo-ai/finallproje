export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface ProductCategory {
  name: string;
}

export interface Product {
  id: string;
  title: string;
  category_id: string;
  price: number;
  description: string;
  image_url: string | null;
  created_at: string;
  updated_at: string | null;
  categories?: ProductCategory | null;
}

export interface ProductInput {
  title: string;
  category_id: string;
  price: number;
  description: string;
  image_url: string;
}

export type FulfillmentType = 'Delivery' | 'Shop Pick Up';

export interface WhatsAppOrderDetails {
  productName: string;
  price: number;
  fulfillment: FulfillmentType;
  location: string;
  customerName: string;
  customerPhone: string;
}
