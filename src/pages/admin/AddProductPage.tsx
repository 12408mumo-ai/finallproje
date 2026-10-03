import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { ImagePlus, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ErrorPanel } from '../../components/ErrorPanel';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { LoadingState } from '../../components/LoadingState';
import { useCategories } from '../../hooks/useCategories';
import { useToast } from '../../hooks/useToast';
import { formatError, getErrorMessage } from '../../lib/errors';
import { validateImageUrl, validateProductImage } from '../../lib/validation';
import { createProduct } from '../../services/products';
import { deleteProductImage, uploadProductImage } from '../../services/storage';

export function AddProductPage() {
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading, error: categoriesError, reload: reloadCategories } = useCategories();
  const { showSuccess, showError, showWarning } = useToast();
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusLabel, setStatusLabel] = useState('');

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    const fileError = validateProductImage(file);
    if (fileError) {
      showWarning(
        formatError({
          title: 'Product Image Warning',
          location: 'Admin → Add Product → Image',
          reason: fileError,
          suggestion: 'Choose an image file that is 5 MB or smaller.',
        }),
      );
      event.target.value = '';
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setTitle('');
    setCategoryId(categories[0]?.id ?? '');
    setPrice('');
    setDescription('');
    setImageFile(null);
    setImageUrl('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedImageUrl = imageUrl.trim();
    const parsedPrice = Number(price);

    if (!trimmedTitle) {
      showError(formatError({ title: 'Product Validation Error', location: 'Admin → Add Product → Title', reason: 'Please enter a product title.' }));
      return;
    }
    if (!categoryId) {
      showError(formatError({ title: 'Product Validation Error', location: 'Admin → Add Product → Category', reason: 'Please select a product category.' }));
      return;
    }
    if (!price || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      showError(
        formatError({
          title: 'Product Validation Error',
          location: 'Admin → Add Product → Price',
          reason: 'Please enter a valid price in KES.',
        }),
      );
      return;
    }
    if (!trimmedDescription) {
      showError(formatError({ title: 'Product Validation Error', location: 'Admin → Add Product → Description', reason: 'Please enter a product description.' }));
      return;
    }
    if (!imageFile && !trimmedImageUrl) {
      showWarning(
        formatError({
          title: 'Product Image Warning',
          location: 'Admin → Add Product → Image',
          reason: 'Please select a product image.',
          suggestion: 'Choose a file or provide an image URL before saving.',
        }),
      );
      return;
    }
    if (imageFile) {
      const fileError = validateProductImage(imageFile);
      if (fileError) {
        showError(formatError({ title: 'Product Validation Error', location: 'Admin → Add Product → Image', reason: fileError }));
        return;
      }
    }
    const imageUrlError = validateImageUrl(trimmedImageUrl);
    if (!imageFile && imageUrlError) {
      showError(formatError({ title: 'Product Validation Error', location: 'Admin → Add Product → Image URL', reason: imageUrlError }));
      return;
    }

    setSubmitting(true);
    let uploadedPath: string | null = null;
    let operation: 'upload' | 'save' = imageFile ? 'upload' : 'save';
    try {
      let finalImageUrl = trimmedImageUrl;
      if (imageFile) {
        setStatusLabel('Uploading image...');
        const upload = await uploadProductImage(imageFile);
        uploadedPath = upload.path;
        finalImageUrl = upload.publicUrl;
        showSuccess('Image uploaded successfully.');
      }

      operation = 'save';
      setStatusLabel('Saving product...');
      await createProduct({
        title: trimmedTitle,
        category_id: categoryId,
        price: parsedPrice,
        description: trimmedDescription,
        image_url: finalImageUrl,
      });
      showSuccess('Product added successfully.');
      resetForm();
      navigate('/admin/products');
    } catch (requestError) {
      if (uploadedPath) {
        try {
          await deleteProductImage(uploadedPath);
        } catch (cleanupError) {
          console.warn('Uploaded image cleanup failed after product save error.', cleanupError);
        }
      }
      if (operation === 'upload') {
        showError(
          formatError({
            title: 'Image Upload Failed',
            location: 'Admin → Add Product → Image Upload',
            reason: getErrorMessage(requestError),
            suggestion: 'Check the product-images bucket permissions and try again.',
          }),
        );
      } else {
        showError(
          formatError({
            title: 'Product Save Failed',
            location: 'Admin → Add Product → Supabase Database → products',
            reason: getErrorMessage(requestError),
            suggestion: 'Check the product fields and database permissions, then try again.',
          }),
        );
      }
    } finally {
      setSubmitting(false);
      setStatusLabel('');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Grow the collection</p>
          <h1>Add Product</h1>
          <p className="admin-page-subtitle">Give customers a clear, beautiful reason to choose their next essential.</p>
        </div>
      </div>

      {categoriesLoading ? <LoadingState label="Loading categories..." compact /> : null}
      {categoriesError ? (
        <ErrorPanel
          compact
          details={formatError({
            title: 'Categories Failed to Load',
            location: 'Admin → Add Product → Supabase Database → categories',
            reason: getErrorMessage(categoriesError),
            suggestion: 'Retry before adding a product so the category dropdown is current.',
          })}
          onRetry={() => void reloadCategories()}
        />
      ) : null}

      <form className="admin-form-layout" onSubmit={handleSubmit} noValidate>
        <section className="admin-panel product-form-panel">
          <div className="panel-heading-row">
            <div>
              <p className="eyebrow">Product details</p>
              <h2>Tell the story clearly.</h2>
            </div>
            <span className="panel-heading-icon"><PackageFormIcon /></span>
          </div>
          <div className="form-field">
            <label htmlFor="product-title">Title <span aria-hidden="true">*</span></label>
            <input id="product-title" type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Enter product title" disabled={submitting} />
          </div>
          <div className="form-two-columns">
            <div className="form-field">
              <label htmlFor="product-category">Category <span aria-hidden="true">*</span></label>
              <select id="product-category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} disabled={submitting || categoriesLoading}>
                <option value="">Select a category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="product-price">Price in KES <span aria-hidden="true">*</span></label>
              <div className="input-prefix"><span>KES</span><input id="product-price" type="number" min="0" step="1" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0" disabled={submitting} /></div>
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="product-description">Description <span aria-hidden="true">*</span></label>
            <textarea id="product-description" rows={6} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the comfort, finish and everyday value of this product." disabled={submitting} />
          </div>
        </section>

        <section className="admin-panel image-form-panel">
          <div className="panel-heading-row">
            <div><p className="eyebrow">Visuals</p><h2>Show it at its best.</h2></div>
            <ImagePlus size={21} className="panel-heading-icon" aria-hidden="true" />
          </div>
          <div className="image-upload-area">
            {previewUrl ? <ImageWithFallback src={previewUrl} alt="Selected product preview" /> : <div className="image-upload-placeholder"><UploadCloud size={27} /><span>Upload a product image</span><small>JPG, PNG or WEBP · max 5 MB</small></div>}
            <label className="button button-secondary image-select-button">
              <UploadCloud size={17} /> {imageFile ? 'Choose a different image' : 'Select image'}
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={submitting} />
            </label>
          </div>
          <div className="form-field">
            <label htmlFor="product-image-url">Image URL <span className="optional-label">(optional)</span></label>
            <input id="product-image-url" type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." disabled={submitting} />
            <small className="field-help">Use a URL when you do not have a local image file. A selected file takes priority.</small>
          </div>
          <div className="form-callout"><strong>Image quality matters.</strong><span>Use a clear, well-lit image with the product as the focus.</span></div>
          <button className="button button-primary full-width" type="submit" disabled={submitting}>
            {submitting ? statusLabel : 'Save product'}
          </button>
        </section>
      </form>
    </div>
  );
}

function PackageFormIcon() {
  return <ImagePlus size={21} aria-hidden="true" />;
}
