import type { ContactInfo } from '../lib/types';
import { Phone, Mail, MapPin } from 'lucide-react';

interface ContactBarProps {
  contact: ContactInfo | null;
}

export function ContactBar({ contact }: ContactBarProps) {
  if (!contact) return null;
  const hasAny = contact.phone || contact.email || contact.address;

  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600">
      {contact.phone && (
        <a
          href={`tel:${contact.phone}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 shadow-sm border border-slate-200 transition-all hover:border-sky-300 hover:text-sky-600 hover:shadow-md"
        >
          <Phone className="h-4 w-4" />
          {contact.phone}
        </a>
      )}
      {contact.email && (
        <a
          href={`mailto:${contact.email}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 shadow-sm border border-slate-200 transition-all hover:border-sky-300 hover:text-sky-600 hover:shadow-md"
        >
          <Mail className="h-4 w-4" />
          {contact.email}
        </a>
      )}
      {contact.address && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 shadow-sm border border-slate-200 transition-all hover:border-sky-300 hover:text-sky-600 hover:shadow-md"
        >
          <MapPin className="h-4 w-4" />
          {contact.address}
        </a>
      )}
    </div>
  );
}
