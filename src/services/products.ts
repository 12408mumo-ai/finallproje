import { getSupabase } from '../lib/supabase';
import type { Product, ProductInput } from '../types';

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await getSupabase()
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Product[];
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data, error } = await getSupabase()
    .from('products')
    .insert(input)
    .select('*, categories(name)')
    .single();

  if (error) {
    throw error;
  }

  return data as Product;
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const { data, error } = await getSupabase()
    .from('products')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, categories(name)')
    .single();

  if (error) {
    throw error;
  }

  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await getSupabase().from('products').delete().eq('id', id);

  if (error) {
    throw error;
  }
}

export async function fetchProductCount(): Promise<number> {
  const { count, error } = await getSupabase()
    .from('products')
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw error;
  }

  return count ?? 0;
}
