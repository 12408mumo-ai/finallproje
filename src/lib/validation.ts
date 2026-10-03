export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function validateProductImage(file: File | null): string | null {
  if (!file) return 'Please select a product image.';
  if (!file.type.startsWith('image/')) return 'The selected file must be an image.';
  if (file.size > MAX_IMAGE_SIZE_BYTES) return 'The selected image must be 5 MB or smaller.';
  return null;
}

export function validateImageUrl(value: string): string | null {
  if (!value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return 'The image URL must start with http:// or https://.';
    }
  } catch {
    return 'Please enter a valid image URL.';
  }
  return null;
}
