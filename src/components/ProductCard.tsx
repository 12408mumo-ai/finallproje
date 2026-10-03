import { ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { Product } from '../types';
import { formatPrice } from '../lib/whatsapp';
import { ImageWithFallback } from './ImageWithFallback';

interface ProductCardProps {
  product: Product;
  onOrder: (product: Product) => void;
  onImageError: (product: Product) => void;
}

export function ProductCard({ product, onOrder, onImageError }: ProductCardProps) {
  const reportedImageError = useRef(false);
  const reportImageError = () => {
    if (!reportedImageError.current) {
      reportedImageError.current = true;
      onImageError(product);
    }
  };

  useEffect(() => {
    if (!product.image_url) reportImageError();
  }, [product.image_url]);

  return (
    <article className="product-card">
      <div className="product-card-image">
        <ImageWithFallback
          src={product.image_url}
          alt={product.title}
          imageClassName="product-card-photo"
          onError={reportImageError}
        />
        <span className="product-category-tag">{product.categories?.name ?? 'Collection'}</span>
      </div>
      <div className="product-card-content">
        <div className="product-card-title-row">
          <h3>{product.title}</h3>
          <span className="product-price">KES {formatPrice(product.price)}</span>
        </div>
        <p>{product.description}</p>
        <button className="button button-outline product-order-button" type="button" onClick={() => onOrder(product)}>
          Order Now
          <ArrowUpRight size={17} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
