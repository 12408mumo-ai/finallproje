import { Check, MapPin, MessageCircle, Store } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { formatError } from '../lib/errors';
import { buildWhatsAppMessage, buildWhatsAppUrl, formatPrice, isKenyanPhoneNumber } from '../lib/whatsapp';
import type { FulfillmentType, Product } from '../types';
import { useToast } from '../hooks/useToast';
import { ImageWithFallback } from './ImageWithFallback';
import { Modal } from './Modal';

interface OrderModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export function OrderModal({ product, open, onClose }: OrderModalProps) {
  const { showError } = useToast();
  const [fulfillment, setFulfillment] = useState<FulfillmentType>('Delivery');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (open) {
      setFulfillment('Delivery');
      setName('');
      setPhone('');
      setLocation('');
    }
  }, [open, product?.id]);

  if (!product) return null;

  const submitOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedLocation = location.trim();

    if (!trimmedName) {
      showError(
        formatError({
          title: 'Order Validation Error',
          location: 'Order Form → Full Name',
          reason: 'Please enter your full name.',
        }),
      );
      return;
    }

    if (!trimmedPhone || !isKenyanPhoneNumber(trimmedPhone)) {
      showError(
        formatError({
          title: 'Order Validation Error',
          location: 'Order Form → Phone Number',
          reason: 'Please enter a valid Kenyan phone number.',
          suggestion: 'Use a format such as 0710 565055, 0110 565055 or +254710565055.',
        }),
      );
      return;
    }

    if (fulfillment === 'Delivery' && !trimmedLocation) {
      showError(
        formatError({
          title: 'Order Validation Error',
          location: 'Order Form → Delivery Location',
          reason: 'Please enter the delivery location.',
        }),
      );
      return;
    }

    const message = buildWhatsAppMessage({
      productName: product.title,
      price: product.price,
      fulfillment,
      location: fulfillment === 'Delivery' ? trimmedLocation : 'Kamkunji Pick Up',
      customerName: trimmedName,
      customerPhone: trimmedPhone,
    });
    const whatsappUrl = buildWhatsAppUrl(message);
    const openedWindow = window.open(whatsappUrl, '_blank', 'noopener');

    if (!openedWindow) {
      window.location.href = whatsappUrl;
    }

    onClose();
  };

  return (
    <Modal open={open} title="Order this piece" onClose={onClose} className="order-modal">
      <div className="order-product-summary">
        <div className="order-product-image">
          <ImageWithFallback src={product.image_url} alt={product.title} />
        </div>
        <div>
          <p className="eyebrow">Your selection</p>
          <h3>{product.title}</h3>
          <p className="order-price">KES {formatPrice(product.price)}</p>
        </div>
      </div>

      <form className="order-form" onSubmit={submitOrder} noValidate>
        <fieldset className="fulfillment-fieldset">
          <legend>How would you like to receive it?</legend>
          <div className="fulfillment-options">
            <label className={`fulfillment-option ${fulfillment === 'Delivery' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="fulfillment"
                value="Delivery"
                checked={fulfillment === 'Delivery'}
                onChange={() => setFulfillment('Delivery')}
              />
              <span className="fulfillment-icon">
                <MapPin size={18} />
              </span>
              <span>
                <strong>Delivery</strong>
                <small>Free delivery within Nairobi and surrounding areas</small>
              </span>
              {fulfillment === 'Delivery' ? <Check className="selected-check" size={17} /> : null}
            </label>
            <label className={`fulfillment-option ${fulfillment === 'Shop Pick Up' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="fulfillment"
                value="Shop Pick Up"
                checked={fulfillment === 'Shop Pick Up'}
                onChange={() => setFulfillment('Shop Pick Up')}
              />
              <span className="fulfillment-icon">
                <Store size={18} />
              </span>
              <span>
                <strong>Shop Pick Up</strong>
                <small>Collect from Kamkunji, Nairobi</small>
              </span>
              {fulfillment === 'Shop Pick Up' ? <Check className="selected-check" size={17} /> : null}
            </label>
          </div>
        </fieldset>

        <div className="form-field">
          <label htmlFor="order-name">Full Name <span aria-hidden="true">*</span></label>
          <input
            id="order-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your full name"
            autoComplete="name"
          />
        </div>
        <div className="form-field">
          <label htmlFor="order-phone">Phone Number <span aria-hidden="true">*</span></label>
          <input
            id="order-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="0710 565055"
            autoComplete="tel"
          />
        </div>
        {fulfillment === 'Delivery' ? (
          <div className="form-field">
            <label htmlFor="order-location">Delivery Location <span aria-hidden="true">*</span></label>
            <input
              id="order-location"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Area, building or estate"
              autoComplete="street-address"
            />
          </div>
        ) : (
          <div className="pickup-note">
            <Store size={17} aria-hidden="true" />
            <span>Pickup location: <strong>Kamkunji, Nairobi</strong></span>
          </div>
        )}
        <button className="button button-whatsapp order-submit" type="submit">
          <MessageCircle size={18} aria-hidden="true" />
          Send Order via WhatsApp
        </button>
      </form>
    </Modal>
  );
}
