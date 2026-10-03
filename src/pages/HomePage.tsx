import { ArrowRight, Globe2, HandCoins, MapPin, PackageCheck, Store, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { formatError, getErrorMessage } from '../lib/errors';
import { categoryImageUrls, heroImageUrl } from '../lib/business';
import { ErrorPanel } from '../components/ErrorPanel';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { LoadingState } from '../components/LoadingState';

const services = [
  {
    icon: Truck,
    title: 'Free Nairobi Delivery',
    copy: 'Free delivery within Nairobi and surrounding areas.',
  },
  {
    icon: Globe2,
    title: 'Countrywide Delivery',
    copy: 'Available countrywide at affordable prices.'
  },
  {
    icon: HandCoins,
    title: 'Pay on Delivery',
    copy: 'Available within Nairobi and surrounding areas.',
  },
  {
    icon: Store,
    title: 'Shop Pickup',
    copy: 'Collect your order from Kamkunji, Nairobi.',
  },
] as const;

export function HomePage() {
  const { categories, loading: categoriesLoading, error: categoriesError, reload } = useCategories();

  return (
    <>
      <main>
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Considered comfort · Nairobi</p>
              <h1>Quality Mattresses, Beddings <em>&amp;</em> Household Essentials</h1>
              <p className="hero-lede">
                Thoughtfully chosen pieces for deeper rest, calmer rooms and a home that feels beautifully yours.
              </p>
              <div className="hero-actions">
                <Link className="button button-primary" to="/shop">
                  Shop Now
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <a className="text-link" href="#services">
                  Why Rafna <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
              <div className="hero-proof">
                <span className="proof-mark"><MapPin size={15} /></span>
                <span><strong>Kamkunji, Nairobi</strong><small>Quality made accessible</small></span>
              </div>
            </div>
            <div className="hero-visual">
              <ImageWithFallback src={heroImageUrl} alt="A serene, warmly styled bedroom with premium bedding" />
              <div className="hero-note">
                <span className="hero-note-number">01</span>
                <span>Made for the way<br />you live.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="services-section" id="services">
          <div className="container">
            <div className="section-intro section-intro-centered">
              <p className="eyebrow">The Rafna promise</p>
              <h2>Thoughtful service, from our door to yours.</h2>
            </div>
            <div className="service-grid">
              {services.map(({ icon: Icon, title, copy }) => (
                <article className="service-card" key={title}>
                  <span className="service-icon"><Icon size={21} aria-hidden="true" /></span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="category-section">
          <div className="container">
            <div className="section-heading-row">
              <div className="section-intro">
                <p className="eyebrow">Explore the collection</p>
                <h2>Comfort, room by room.</h2>
              </div>
              <Link className="text-link section-link" to="/shop">
                Browse everything <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            {categoriesLoading ? <LoadingState label="Loading categories..." /> : null}
            {categoriesError ? (
              <ErrorPanel
                details={formatError({
                  title: 'Categories Failed to Load',
                  location: 'Home → Supabase Database → categories',
                  reason: getErrorMessage(categoriesError),
                  suggestion: 'Check the connection and try again.',
                })}
                onRetry={() => void reload()}
              />
            ) : null}
            {!categoriesLoading && !categoriesError && categories.length === 0 ? (
              <div className="empty-state compact-empty">
                <PackageCheck size={24} aria-hidden="true" />
                <p>No categories are available yet.</p>
              </div>
            ) : null}
            {!categoriesLoading && !categoriesError && categories.length > 0 ? (
              <div className="category-grid">
                {categories.map((category, index) => (
                  <Link className="category-card" to={`/shop?category=${encodeURIComponent(category.name)}`} key={category.id}>
                    <ImageWithFallback
                      src={categoryImageUrls[index % categoryImageUrls.length]}
                      alt={`${category.name} collection`}
                    />
                    <div className="category-card-overlay">
                      <h3>{category.name}</h3>
                      <span>View collection <ArrowRight size={15} aria-hidden="true" /></span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="home-cta-section">
          <div className="container home-cta">
            <div>
              <p className="eyebrow">Your best rest starts here</p>
              <h2>Find the pieces that make home feel like home.</h2>
            </div>
            <Link className="button button-light" to="/shop">
              Explore the shop <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
