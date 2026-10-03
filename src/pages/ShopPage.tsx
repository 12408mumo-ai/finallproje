import { useEffect, useMemo, useState } from 'react';
import { PackageOpen, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ErrorPanel } from '../components/ErrorPanel';
import { LoadingState } from '../components/LoadingState';
import { OrderModal } from '../components/OrderModal';
import { ProductCard } from '../components/ProductCard';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { useToast } from '../hooks/useToast';
import { formatError, getErrorMessage } from '../lib/errors';
import type { Product } from '../types';

export function ShopPage() {
  const { products, loading: productsLoading, error: productsError, reload: reloadProducts } = useProducts();
  const { categories, loading: categoriesLoading, error: categoriesError, reload: reloadCategories } = useCategories();
  const { showWarning } = useToast();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const requestedCategory = searchParams.get('category');
    if (requestedCategory && categories.some((category) => category.name === requestedCategory)) {
      setSelectedCategory(requestedCategory);
    } else {
      setSelectedCategory('All');
    }
  }, [categories, searchParams]);

  const filteredProducts = useMemo(
    () =>
      selectedCategory === 'All'
        ? products
        : products.filter((product) => product.categories?.name === selectedCategory),
    [products, selectedCategory],
  );

  const handleImageError = (product: Product) => {
    showWarning(
      formatError({
        title: 'Image Loading Error',
        location: 'Shop → Product Card',
        product: product.title,
        reason: 'The product image URL could not be loaded.',
        suggestion: 'Please contact Rafna Investment if the image remains unavailable.',
      }),
    );
  };

  return (
    <main className="shop-page">
      <section className="shop-hero">
        <div className="container shop-hero-inner">
          <div>
            <p className="eyebrow">The collection</p>
            <h1>Comfort, chosen well.</h1>
            <p>Explore quality mattresses, beddings and household essentials, selected for everyday Kenyan living.</p>
          </div>
          <div className="shop-hero-detail"><SlidersHorizontal size={18} /><span>Browse by collection</span></div>
        </div>
      </section>

      <section className="shop-content container">
        <div className="filter-bar" aria-label="Product categories">
          <span className="filter-label">Collections</span>
          <div className="filter-chips">
            <button
              className={`filter-chip ${selectedCategory === 'All' ? 'active' : ''}`}
              type="button"
              onClick={() => setSelectedCategory('All')}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                className={`filter-chip ${selectedCategory === category.name ? 'active' : ''}`}
                type="button"
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {categoriesLoading ? <LoadingState label="Loading categories..." compact /> : null}
        {categoriesError ? (
          <ErrorPanel
            compact
            details={formatError({
              title: 'Categories Failed to Load',
              location: 'Shop → Supabase Database → categories',
              reason: getErrorMessage(categoriesError),
              suggestion: 'Retry to refresh the collection filters.',
            })}
            onRetry={() => void reloadCategories()}
          />
        ) : null}

        {productsLoading ? <LoadingState label="Loading products..." /> : null}
        {productsError ? (
          <ErrorPanel
            details={formatError({
              title: 'Products Failed to Load',
              location: 'Shop → Supabase Database → products',
              reason: getErrorMessage(productsError),
              suggestion: 'Check the Supabase connection, then retry the request.',
            })}
            onRetry={() => void reloadProducts()}
          />
        ) : null}

        {!productsLoading && !productsError && filteredProducts.length === 0 ? (
          <div className="empty-state shop-empty">
            <span className="empty-state-icon"><PackageOpen size={26} /></span>
            <h2>{products.length === 0 ? 'The collection is being prepared.' : 'No pieces in this collection yet.'}</h2>
            <p>
              {products.length === 0
                ? 'Please check back soon for new arrivals from Rafna Investment.'
                : 'Try another category to explore the rest of the collection.'}
            </p>
            {products.length > 0 ? (
              <button className="button button-secondary" type="button" onClick={() => setSelectedCategory('All')}>
                View all products
              </button>
            ) : null}
          </div>
        ) : null}

        {!productsLoading && !productsError && filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onOrder={setSelectedProduct} onImageError={handleImageError} />
            ))}
          </div>
        ) : null}
      </section>
      <OrderModal product={selectedProduct} open={Boolean(selectedProduct)} onClose={() => setSelectedProduct(null)} />
    </main>
  );
}
