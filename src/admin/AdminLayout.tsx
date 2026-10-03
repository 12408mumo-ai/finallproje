import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Boxes, FolderKanban, LayoutDashboard, LogOut, Menu, PackagePlus, X } from 'lucide-react';
import { Logo } from '../components/Logo';
import { formatError } from '../lib/errors';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Products', to: '/admin/products', icon: Boxes, end: true },
  { label: 'Add Product', to: '/admin/products/new', icon: PackagePlus, end: true },
  { label: 'Categories', to: '/admin/categories', icon: FolderKanban, end: true },
] as const;

export function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { signOut } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      showSuccess('Logged out successfully.');
      navigate('/admin/login', { replace: true });
    } catch (error) {
      showError(
        formatError({
          title: 'Logout Failed',
          location: 'Admin Layout → Supabase Authentication',
          reason: error instanceof Error ? error.message : 'The authentication service could not end the session.',
          suggestion: 'Try again, then close the browser if the session does not end.',
        }),
      );
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="admin-app">
      <aside className={`admin-sidebar ${drawerOpen ? 'admin-sidebar-open' : ''}`}>
        <div className="admin-sidebar-top">
          <Logo />
          <button className="admin-drawer-close icon-button" type="button" aria-label="Close navigation" onClick={() => setDrawerOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="admin-label">Workspace</div>
        <nav className="admin-nav" aria-label="Admin navigation">
          {navItems.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setDrawerOpen(false)}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <Link to="/" className="back-to-site" onClick={() => setDrawerOpen(false)}>
            View public website
          </Link>
          <button className="admin-logout" type="button" disabled={loggingOut} onClick={() => void handleLogout()}>
            <LogOut size={18} aria-hidden="true" />
            {loggingOut ? 'Signing out...' : 'Logout'}
          </button>
        </div>
      </aside>
      {drawerOpen ? <button className="admin-drawer-overlay" type="button" aria-label="Close navigation" onClick={() => setDrawerOpen(false)} /> : null}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-button icon-button" type="button" aria-label="Open navigation" onClick={() => setDrawerOpen(true)}>
            <Menu size={21} />
          </button>
          <div>
            <p className="admin-topbar-kicker">Rafna Investment</p>
            <p className="admin-topbar-path">{getPageName(location.pathname)}</p>
          </div>
          <Link className="admin-topbar-site-link" to="/">
            Visit site
          </Link>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function getPageName(pathname: string): string {
  if (pathname === '/admin') return 'Dashboard';
  if (pathname.includes('/categories')) return 'Categories';
  if (pathname.includes('/products/new')) return 'Add Product';
  if (pathname.includes('/products')) return 'Products';
  return 'Admin workspace';
}
