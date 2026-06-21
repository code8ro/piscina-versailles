import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-500">
      <a
        href="https://www.instagram.com/ricardobrown_"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-slate-500 transition-colors hover:text-rose-500"
      >
        Crafted with <Heart className="inline h-3.5 w-3.5 fill-rose-500 text-rose-500" /> by Ricardo Brown
      </a>
    </footer>
  );
}
