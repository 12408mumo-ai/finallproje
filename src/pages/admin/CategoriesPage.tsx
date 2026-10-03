import { useState, type FormEvent } from 'react';
import { FolderKanban, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ErrorPanel } from '../../components/ErrorPanel';
import { LoadingState } from '../../components/LoadingState';
import { useCategories } from '../../hooks/useCategories';
import { useToast } from '../../hooks/useToast';
import { formatError, getErrorCode, getErrorMessage } from '../../lib/errors';
import { createCategory, deleteCategory } from '../../services/categories';
import type { Category } from '../../types';

export function CategoriesPage() {
  const { categories, loading, error, reload } = useCategories();
  const { showSuccess, showError, showWarning } = useToast();
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      showWarning(
        formatError({
          title: 'Category Validation Error',
          location: 'Admin → Categories → Name',
          reason: 'Please enter a category name.',
        }),
      );
      return;
    }

    setCreating(true);
    try {
      await createCategory(trimmedName);
      setName('');
      await reload();
      showSuccess('Category created successfully.');
    } catch (requestError) {
      const duplicate = getErrorCode(requestError) === '23505';
      showError(
        formatError({
          title: 'Category Creation Failed',
          location: 'Admin → Categories',
          reason: duplicate ? 'This category already exists.' : getErrorMessage(requestError),
          suggestion: duplicate ? 'Use a different category name.' : 'Check the database connection and try again.',
        }),
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setDeletingId(categoryToDelete.id);
    try {
      await deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      await reload();
      showSuccess('Category deleted successfully.');
    } catch (requestError) {
      const hasProducts = getErrorCode(requestError) === '23503';
      showError(
        formatError({
          title: 'Category Deletion Failed',
          location: 'Admin → Categories',
          reason: hasProducts
            ? 'This category still has products. Move or delete those products first.'
            : getErrorMessage(requestError),
          suggestion: hasProducts ? 'Move or delete the products in this category, then try again.' : 'Check the database connection and try again.',
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
          <p className="eyebrow">Organise the shop</p>
          <h1>Categories</h1>
          <p className="admin-page-subtitle">Create collections that help customers find their next favourite piece.</p>
        </div>
      </div>

      <div className="category-admin-grid">
        <section className="admin-panel category-create-panel">
          <span className="panel-icon"><Plus size={20} /></span>
          <p className="eyebrow">New collection</p>
          <h2>Add Category</h2>
          <p className="panel-copy">A new category becomes available in product forms and shop filters immediately.</p>
          <form className="stacked-form" onSubmit={handleCreate} noValidate>
            <div className="form-field">
              <label htmlFor="category-name">Category name <span aria-hidden="true">*</span></label>
              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter category name"
                disabled={creating}
              />
            </div>
            <button className="button button-primary" type="submit" disabled={creating}>
              {creating ? 'Creating category...' : 'Create category'}
            </button>
          </form>
        </section>

        <section className="admin-panel category-list-panel">
          <div className="panel-heading-row">
            <div>
              <p className="eyebrow">Your collections</p>
              <h2>All Categories <span className="heading-count">{categories.length}</span></h2>
            </div>
            <FolderKanban size={22} className="panel-heading-icon" aria-hidden="true" />
          </div>
          {loading ? <LoadingState label="Loading categories..." compact /> : null}
          {error ? (
            <ErrorPanel
              compact
              details={formatError({
                title: 'Categories Failed to Load',
                location: 'Admin → Categories → Supabase Database',
                reason: getErrorMessage(error),
                suggestion: 'Retry to load your current categories.',
              })}
              onRetry={() => void reload()}
            />
          ) : null}
          {!loading && !error && categories.length === 0 ? (
            <div className="empty-state compact-empty"><FolderKanban size={22} /><p>No categories have been created yet.</p></div>
          ) : null}
          {!loading && !error && categories.length > 0 ? (
            <div className="category-list">
              {categories.map((category) => (
                <div className="category-list-item" key={category.id}>
                  <span className="category-list-number">{category.name.slice(0, 1).toUpperCase()}</span>
                  <span className="category-list-name">{category.name}</span>
                  <button
                    className="icon-button icon-button-danger"
                    type="button"
                    aria-label={`Delete ${category.name}`}
                    onClick={() => setCategoryToDelete(category)}
                    disabled={Boolean(deletingId)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(categoryToDelete)}
        title="Delete this category?"
        message={categoryToDelete ? `Delete “${categoryToDelete.name}”? Categories with products cannot be removed.` : ''}
        confirmLabel="Delete category"
        loading={Boolean(deletingId)}
        loadingLabel="Deleting category..."
        onCancel={() => setCategoryToDelete(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
