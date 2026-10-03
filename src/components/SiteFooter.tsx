import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { business } from '../lib/business';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand-block">
          <Link to="/" className="footer-wordmark">
            <span className="footer-mark">R</span>
            <span>
              Rafna <em>Investment</em>
            </span>
          </Link>
          <p>Restful nights, considered living and dependable essentials for every Nairobi home.</p>
        </div>
        <div className="footer-contact">
          <p className="footer-heading">Visit or reach us</p>
          <a href="https://www.google.com/maps/search/?api=1&query=Kamkunji%2C%20Nairobi%2C%20Kenya" target="_blank" rel="noreferrer">
            <MapPin size={16} />
            {business.location}
          </a>
          <a href={`tel:${business.phoneDisplay.replace(/\s/g, '')}`}>
            <Phone size={16} />
            {business.phoneDisplay}
          </a>
          <a href={`mailto:${business.email}`}>
            <Mail size={16} />
            {business.email}
          </a>
        </div>
        <div className="footer-action">
          <p className="footer-heading">Need help choosing?</p>
          <p>Talk to our team about the right comfort for your space.</p>
          <a
            className="whatsapp-link"
            href={`https://wa.me/${business.whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} />
            Chat on WhatsApp
          </a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Rafna Investment</span>
        <span>Kamkunji · Nairobi · Kenya</span>
      </div>
    </footer>
  );
}
