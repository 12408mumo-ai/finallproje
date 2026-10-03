import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="full-page-state not-found-page">
      <span className="not-found-number">404</span>
      <span className="state-icon state-icon-gold"><Compass size={26} /></span>
      <p className="eyebrow">A quiet corner</p>
      <h1>We couldn't find that page.</h1>
      <p>The page may have moved, or the address may have been entered incorrectly.</p>
      <Link className="button button-primary" to="/">
        <ArrowLeft size={17} /> Return home
      </Link>
    </main>
  );
}
