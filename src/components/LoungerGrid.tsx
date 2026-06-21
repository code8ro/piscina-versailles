import type { Lounger, Reservation } from '../lib/types';
import { getLoungerStatusForDate } from '../lib/data';

interface LoungerGridProps {
  loungers: Lounger[];
  reservations: Reservation[];
  date: string;
  selectedLounger: number | null;
  onSelectLounger: (id: number) => void;
  isAdmin?: boolean;
}

export function LoungerGrid({ loungers, reservations, date, selectedLounger, onSelectLounger, isAdmin }: LoungerGridProps) {
  const activeLoungers = loungers.filter((l) => l.is_active);

  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-10">
      {activeLoungers.map((lounger) => {
        const status = getLoungerStatusForDate(reservations, lounger.id, date);
        const isSelected = selectedLounger === lounger.id;

        let bgColor = 'bg-emerald-50';
        let borderColor = 'border-emerald-300';
        let textColor = 'text-emerald-700';
        let statusDot = 'bg-emerald-500';
        let hoverClass = 'hover:border-emerald-400 hover:shadow-md';

        if (status === 'reserved') {
          bgColor = 'bg-red-50';
          borderColor = 'border-red-300';
          textColor = 'text-red-700';
          statusDot = 'bg-red-500';
          hoverClass = isAdmin ? 'hover:border-red-400 hover:shadow-md' : '';
        }

        if (isSelected) {
          bgColor = 'bg-sky-50';
          borderColor = 'border-sky-400';
          textColor = 'text-sky-700';
          statusDot = 'bg-sky-500';
          hoverClass = '';
        }

        return (
          <button
            key={lounger.id}
            onClick={() => onSelectLounger(isSelected ? 0 : lounger.id)}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 p-3 transition-all duration-200 ${bgColor} ${borderColor} ${textColor} ${hoverClass} ${isSelected ? 'ring-2 ring-sky-300 shadow-lg scale-105' : ''}`}
          >
            <span className={`mb-1 h-2.5 w-2.5 rounded-full ${statusDot}`} />
            <span className="text-lg font-bold">{lounger.number}</span>
            {lounger.label && <span className="text-[10px] opacity-70 truncate max-w-full">{lounger.label}</span>}
            <svg viewBox="0 0 40 20" className="mt-1 h-5 w-10 opacity-30" fill="currentColor">
              <rect x="0" y="6" width="28" height="8" rx="3" />
              <rect x="28" y="4" width="8" height="12" rx="2" />
              <rect x="2" y="14" width="4" height="4" rx="1" />
              <rect x="22" y="14" width="4" height="4" rx="1" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
