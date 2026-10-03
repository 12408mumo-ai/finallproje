import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Boxes, FolderKanban, PackagePlus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ErrorPanel } from '../../components/ErrorPanel';
import { LoadingState } from '../../components/LoadingState';
import { formatError, getErrorMessage } from '../../lib/errors';
import { fetchCategoryCount } from '../../services/categories';
import { fetchProductCount } from '../../services/products';

export function DashboardPage() {
  const [stats, setStats] = useState({ products: 0, categories: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [products, categories] = await Promise.all([fetchProductCount(), fetchCategoryCount()]);
      setStats({ products, categories });
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Good to see you</p>
          <h1>Dashboard</h1>
          <p className="admin-page-subtitle">A clear view of your Rafna Investment collection.</p>
        </div>
        <button className="button button-secondary" type="button" onClick={() => void loadStats()} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {loading ? <LoadingState label="Loading dashboard..." /> : null}
      {error ? (
        <ErrorPanel
          details={formatError({
            title: 'Dashboard Failed to Load',
            location: 'Admin Dashboard → Supabase Database',
            reason: getErrorMessage(error),
            suggestion: 'Retry to load the current product and category totals.',
          })}
          onRetry={() => void loadStats()}
        />
      ) : null}

      {!loading && !error ? (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-card-icon"><Boxes size={20} /></span>
              <span className="stat-label">Total products</span>
              <strong>{stats.products}</strong>
              <span className="stat-foot">Live in your public shop</span>
            </div>
            <div className="stat-card stat-card-gold">
              <span className="stat-card-icon"><FolderKanban size={20} /></span>
              <span className="stat-label">Total categories</span>
              <strong>{stats.categories}</strong>
              <span className="stat-foot">Available for organisation</span>
            </div>
          </div>
          <section className="quick-links-section">
            <div className="section-intro">
              <p className="eyebrow">Shortcuts</p>
              <h2>Keep the collection moving.</h2>
            </div>
            <div className="quick-link-grid">
              <Link className="quick-link-card" to="/admin/products/new">
                <span className="quick-link-icon"><PackagePlus size={21} /></span>
                <span><strong>Add a product</strong><small>Bring a new piece into the shop.</small></span>
                <ArrowRight size={17} />
              </Link>
              <Link className="quick-link-card" to="/admin/products">
                <span className="quick-link-icon"><Boxes size={21} /></span>
                <span><strong>Manage products</strong><small>Edit details, images or pricing.</small></span>
                <ArrowRight size={17} />
              </Link>
              <Link className="quick-link-card" to="/admin/categories">
                <span className="quick-link-icon"><FolderKanban size={21} /></span>
                <span><strong>Organise categories</strong><small>Keep your collections easy to browse.</small></span>
                <ArrowRight size={17} />
              </Link>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
