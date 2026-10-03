import { business } from './business';
import type { WhatsAppOrderDetails } from '../types';

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-KE', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Number(price));
}

export function buildWhatsAppMessage({
  productName,
  price,
  fulfillment,
  location,
  customerName,
  customerPhone,
}: WhatsAppOrderDetails): string {
  return `Hello ${business.name}, I would like to order:

Product: ${productName}
Price: KES ${formatPrice(price)}
Fulfillment: ${fulfillment}
Location: ${location}
Name: ${customerName}
Phone: ${customerPhone}`;
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function isKenyanPhoneNumber(phone: string): boolean {
  const normalized = phone.replace(/[\s()-]/g, '');
  return /^(?:0(?:7|1)\d{8}|\+254(?:7|1)\d{8}|254(?:7|1)\d{8})$/.test(normalized);
}
