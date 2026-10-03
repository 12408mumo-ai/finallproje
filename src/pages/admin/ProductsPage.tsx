import { useState } from 'react';
import { Edit3, PackageOpen, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ErrorPanel } from '../../components/ErrorPanel';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { LoadingState } from '../../components/LoadingState';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { useToast } from '../../hooks/useToast';
import { formatError, getErrorMessage } from '../../lib/errors';
import { formatPrice } from '../../lib/whatsapp';
import { deleteProduct } from '../../services/products';
import { deleteProductImageByUrl } from '../../services/storage';
import type { Product } from '../../types';
import { EditProductModal } from '../../admin/EditProductModal';

export function ProductsPage() {
  const { products, setProducts, loading, error, reload } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { showSuccess, showError, showWarning } = useToast();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!productToDelete) return;
    const product = productToDelete;
    setDeletingId(product.id);
    try {
      await deleteProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setProductToDelete(null);
      showSuccess('Product deleted successfully.');
      if (product.image_url) {
        try {
          await deleteProductImageByUrl(product.image_url);
        } catch (cleanupError) {
          console.warn('Product image cleanup failed after delete.', cleanupError);
          showWarning(
            formatError({
              title: 'Image Cleanup Warning',
              location: 'Admin → Delete Product → Supabase Storage',
              reason: getErrorMessage(cleanupError),
              suggestion: 'The product was deleted successfully; its image may remain in storage.',
            }),
          );
        }
      }
    } catch (requestError) {
      showError(
        formatError({
          title: 'Product Delete Failed',
          location: 'Admin → Delete Product → Supabase Database',
          reason: getErrorMessage(requestError),
          suggestion: 'Check the database permissions and try again.',
        }),
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">The live collection</p>
          <h1>Products</h1>
          <p className="admin-page-subtitle">Keep every title, price and image as considered as the product itself.</p>
        </div>
        <Link className="button button-primary" to="/admin/products/new"><Plus size={17} /> Add Product</Link>
      </div>

      {loading ? <LoadingState label="Loading products..." /> : null}
      {error ? (
        <ErrorPanel
          details={formatError({
            title: 'Products Failed to Load',
            location: 'Admin → Products → Supabase Database → products',
            reason: getErrorMessage(error),
            suggestion: 'Retry to load the current collection.',
          })}
          onRetry={() => void reload()}
        />
      ) : null}
      {!loading && !error && products.length === 0 ? (
        <div className="empty-state admin-empty"><span className="empty-state-icon"><PackageOpen size={26} /></span><h2>No products yet.</h2><p>Add the first piece to make your public collection feel complete.</p><Link className="button button-primary" to="/admin/products/new"><Plus size={17} /> Add Product</Link></div>
      ) : null}
      {!loading && !error && products.length > 0 ? (
        <section className="admin-panel products-panel">
          <div className="panel-heading-row products-panel-heading">
            <div><p className="eyebrow">Inventory</p><h2>All Products <span className="heading-count">{products.length}</span></h2></div>
            <span className="product-panel-note">Changes publish to the shop on the next load.</span>
          </div>
          <div className="product-table-wrapper">
            <table className="product-table">
              <thead>
                <tr><th>Image</th><th>Product</th><th>Category</th><th>Price (KES)</th><th><span className="sr-only">Actions</span></th></tr>
              </thead>
              <tbody>
                {products.map((product) => <ProductTableRow key={product.id} product={product} onEdit={setEditingProduct} onDelete={setProductToDelete} disabled={Boolean(deletingId)} />)}
              </tbody>
            </table>
          </div>
          <div className="product-mobile-list">
            {products.map((product) => (
              <article className="product-admin-card" key={product.id}>
                <div className="product-admin-card-top"><ImageWithFallback src={product.image_url} alt={product.title} /><div><span className="product-admin-category">{product.categories?.name ?? 'Uncategorised'}</span><h3>{product.title}</h3><strong>KES {formatPrice(product.price)}</strong></div></div>
                <p>{product.description}</p>
                <div className="product-admin-actions"><button className="button button-secondary button-small" type="button" onClick={() => setEditingProduct(product)} disabled={Boolean(deletingId)}><Edit3 size={15} /> Edit</button><button className="button button-danger-outline button-small" type="button" onClick={() => setProductToDelete(product)} disabled={Boolean(deletingId)}><Trash2 size={15} /> Delete</button></div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <EditProductModal product={editingProduct} categories={categories} open={Boolean(editingProduct)} onClose={() => setEditingProduct(null)} onSaved={() => reload()} />
      <ConfirmDialog
        open={Boolean(productToDelete)}
        title="Delete this product?"
        message="Are you sure you want to delete this product?"
        confirmLabel="Delete product"
        loading={Boolean(deletingId)}
        loadingLabel="Deleting product..."
        onCancel={() => setProductToDelete(null)}
        onConfirm={() => void handleDelete()}
      />
      {categoriesLoading ? <span className="sr-only">Loading categories for product editing...</span> : null}
    </div>
  );
}

function ProductTableRow({ product, onEdit, onDelete, disabled }: { product: Product; onEdit: (product: Product) => void; onDelete: (product: Product) => void; disabled: boolean }) {
  return (
    <tr>
      <td><ImageWithFallback src={product.image_url} alt={product.title} /></td>
      <td><strong className="table-product-name">{product.title}</strong><span className="table-product-description">{product.description}</span></td>
      <td><span className="table-category">{product.categories?.name ?? 'Uncategorised'}</span></td>
      <td><strong>KES {formatPrice(product.price)}</strong></td>
      <td><div className="table-actions"><button className="icon-button" type="button" aria-label={`Edit ${product.title}`} onClick={() => onEdit(product)} disabled={disabled}><Edit3 size={16} /></button><button className="icon-button icon-button-danger" type="button" aria-label={`Delete ${product.title}`} onClick={() => onDelete(product)} disabled={disabled}><Trash2 size={16} /></button></div></td>
    </tr>
  );
}
