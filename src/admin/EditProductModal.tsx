import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { ImagePlus, UploadCloud } from 'lucide-react';
import { formatError, getErrorMessage } from '../lib/errors';
import { validateProductImage } from '../lib/validation';
import { useToast } from '../hooks/useToast';
import type { Category, Product } from '../types';
import { updateProduct } from '../services/products';
import { deleteProductImage, deleteProductImageByUrl, uploadProductImage } from '../services/storage';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { Modal } from '../components/Modal';

interface EditProductModalProps {
  product: Product | null;
  categories: Category[];
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

export function EditProductModal({ product, categories, open, onClose, onSaved }: EditProductModalProps) {
  const { showSuccess, showError, showWarning } = useToast();
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!product || !open) return;
    setTitle(product.title);
    setCategoryId(product.category_id);
    setPrice(String(product.price));
    setDescription(product.description);
    setImageFile(null);
    setPreviewUrl(null);
  }, [open, product]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!product) return null;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    const imageError = validateProductImage(file);
    if (imageError) {
      showWarning(
        formatError({
          title: 'Product Image Warning',
          location: 'Admin → Edit Product → New Image',
          reason: imageError,
          suggestion: 'Choose an image file that is 5 MB or smaller.',
        }),
      );
      event.target.value = '';
      return;
    }
    setImageFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const parsedPrice = Number(price);
    if (!trimmedTitle) {
      showError(formatError({ title: 'Product Validation Error', location: 'Admin → Edit Product → Title', reason: 'Please enter a product title.' }));
      return;
    }
    if (!categoryId) {
      showError(formatError({ title: 'Product Validation Error', location: 'Admin → Edit Product → Category', reason: 'Please select a product category.' }));
      return;
    }
    if (!price || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      showError(formatError({ title: 'Product Validation Error', location: 'Admin → Edit Product → Price', reason: 'Please enter a valid price in KES.' }));
      return;
    }
    if (!trimmedDescription) {
      showError(formatError({ title: 'Product Validation Error', location: 'Admin → Edit Product → Description', reason: 'Please enter a product description.' }));
      return;
    }
    if (imageFile) {
      const imageError = validateProductImage(imageFile);
      if (imageError) {
        showError(formatError({ title: 'Product Validation Error', location: 'Admin → Edit Product → New Image', reason: imageError }));
        return;
      }
    }

    setSaving(true);
    let newImagePath: string | null = null;
    let operation: 'upload' | 'update' = imageFile ? 'upload' : 'update';
    try {
      let imageUrl = product.image_url ?? '';
      if (imageFile) {
        const upload = await uploadProductImage(imageFile);
        newImagePath = upload.path;
        imageUrl = upload.publicUrl;
        showSuccess('Image uploaded successfully.');
      }

      operation = 'update';
      await updateProduct(product.id, {
        title: trimmedTitle,
        category_id: categoryId,
        price: parsedPrice,
        description: trimmedDescription,
        image_url: imageUrl,
      });

      if (newImagePath && product.image_url) {
        try {
          await deleteProductImageByUrl(product.image_url);
        } catch (cleanupError) {
          console.warn('Old product image cleanup failed after update.', cleanupError);
          showWarning(
            formatError({
              title: 'Image Cleanup Warning',
              location: 'Admin → Edit Product → Supabase Storage',
              reason: getErrorMessage(cleanupError),
              suggestion: 'The product was updated successfully; the previous image may remain in storage.',
            }),
          );
        }
      }

      await onSaved();
      showSuccess('Product updated successfully.');
      onClose();
    } catch (requestError) {
      if (newImagePath) {
        try {
          await deleteProductImage(newImagePath);
        } catch (cleanupError) {
          console.warn('New image cleanup failed after product update error.', cleanupError);
        }
      }
      if (operation === 'upload') {
        showError(
          formatError({
            title: 'Image Upload Failed',
            location: 'Admin → Edit Product → Supabase Storage',
            reason: getErrorMessage(requestError),
            suggestion: 'Check the product-images bucket permissions and try again.',
          }),
        );
      } else {
        showError(
          formatError({
            title: 'Product Update Failed',
            location: 'Admin → Edit Product → Supabase Database',
            reason: getErrorMessage(requestError),
            suggestion: 'Check the product fields and database permissions, then try again.',
          }),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Edit product" onClose={saving ? () => undefined : onClose} className="edit-product-modal">
      <form className="edit-product-form" onSubmit={handleSubmit} noValidate>
        <div className="edit-product-layout">
          <div className="edit-product-image-column">
            <p className="form-section-label">Current image</p>
            <div className="edit-current-image"><ImageWithFallback src={previewUrl ?? product.image_url} alt={product.title} /></div>
            <label className="button button-secondary image-select-button">
              <ImagePlus size={17} /> {imageFile ? 'Choose a different image' : 'New Image (optional)'}
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={saving} />
            </label>
            <small className="field-help">Leave this untouched to keep the existing image. Max 5 MB.</small>
          </div>
          <div className="edit-fields-column">
            <div className="form-field">
              <label htmlFor="edit-product-title">Title <span aria-hidden="true">*</span></label>
              <input id="edit-product-title" type="text" value={title} onChange={(event) => setTitle(event.target.value)} disabled={saving} />
            </div>
            <div className="form-two-columns">
              <div className="form-field">
                <label htmlFor="edit-product-category">Category <span aria-hidden="true">*</span></label>
                <select id="edit-product-category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} disabled={saving}>
                  <option value="">Select a category</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="edit-product-price">Price in KES <span aria-hidden="true">*</span></label>
                <div className="input-prefix"><span>KES</span><input id="edit-product-price" type="number" min="0" step="1" value={price} onChange={(event) => setPrice(event.target.value)} disabled={saving} /></div>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="edit-product-description">Description <span aria-hidden="true">*</span></label>
              <textarea id="edit-product-description" rows={6} value={description} onChange={(event) => setDescription(event.target.value)} disabled={saving} />
            </div>
          </div>
        </div>
        <div className="modal-form-actions">
          <button className="button button-secondary" type="button" disabled={saving} onClick={onClose}>Cancel</button>
          <button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Updating product...' : 'Save Changes'}</button>
        </div>
      </form>
    </Modal>
  );
}
