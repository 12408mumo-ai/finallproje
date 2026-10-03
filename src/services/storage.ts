import { getSupabase } from '../lib/supabase';

export const PRODUCT_IMAGE_BUCKET = 'product-images';

function getFileExtension(fileName: string): string {
  const extension = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')) : '.jpg';
  return extension.toLowerCase().replace(/[^a-z0-9.]/g, '') || '.jpg';
}

function makeUniqueFilePath(file: File): string {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${id}${getFileExtension(file.name)}`;
}

export async function uploadProductImage(file: File): Promise<{ path: string; publicUrl: string }> {
  const path = makeUniqueFilePath(file);
  const { error } = await getSupabase().storage.from(PRODUCT_IMAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = getSupabase().storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export async function deleteProductImage(path: string): Promise<void> {
  const { error } = await getSupabase().storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);

  if (error) {
    throw error;
  }
}

export function getProductImagePath(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) {
    return null;
  }

  const marker = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
  const markerIndex = imageUrl.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }

  const path = imageUrl.slice(markerIndex + marker.length).split('?')[0];
  return path ? decodeURIComponent(path) : null;
}

export async function deleteProductImageByUrl(imageUrl: string | null | undefined): Promise<void> {
  const path = getProductImagePath(imageUrl);
  if (path) {
    await deleteProductImage(path);
  }
}
