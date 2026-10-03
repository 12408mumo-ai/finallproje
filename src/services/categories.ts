import { getSupabase } from '../lib/supabase';
import type { Category } from '../types';

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await getSupabase()
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as Category[];
}

export async function createCategory(name: string): Promise<Category> {
  const { data, error } = await getSupabase()
    .from('categories')
    .insert({ name })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await getSupabase().from('categories').delete().eq('id', id);

  if (error) {
    throw error;
  }
}

export async function fetchCategoryCount(): Promise<number> {
  const { count, error } = await getSupabase()
    .from('categories')
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw error;
  }

  return count ?? 0;
}
