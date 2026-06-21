import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ClosedDay, ScheduleDay } from '../lib/types';

interface CalendarProps {
  year: number;
  month: number;
  onNavigate: (year: number, month: number) => void;
  onSelectDay: (date: string) => void;
  selectedDate: string | null;
  closedDays: ClosedDay[];
  schedule: ScheduleDay[];
}

const MONTH_NAMES = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
];

const WEEKDAY_HEADERS = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du'];

export function Calendar({ year, month, onNavigate, onSelectDay, selectedDate, closedDays, schedule }: CalendarProps) {
  const closedDatesSet = useMemo(() => new Set(closedDays.map((cd) => cd.date)), [closedDays]);
  const scheduleMap = useMemo(() => {
    const map = new Map<number, ScheduleDay>();
    schedule.forEach((s) => map.set(s.day_of_week, s));
    return map;
  }, [schedule]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();

  const startDow = firstDay.getDay();
  const startOffset = startDow === 0 ? 6 : startDow - 1;

  const prevMonth = new Date(year, month - 2, 1);
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate();

  const cells: { date: string; day: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const pm = month - 1 === 0 ? 12 : month - 1;
    const py = month - 1 === 0 ? year - 1 : year;
    cells.push({
      date: `${py}-${pm.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`,
      day: d,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    const cellDate = new Date(year, month - 1, d);
    cellDate.setHours(0, 0, 0, 0);
    cells.push({
      date: dateStr,
      day: d,
      isCurrentMonth: true,
      isToday: cellDate.getTime() === today.getTime(),
    });
  }

  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const nm = month + 1 === 13 ? 1 : month + 1;
    const ny = month + 1 === 13 ? year + 1 : year;
    cells.push({
      date: `${ny}-${nm.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`,
      day: d,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  const prev = () => {
    if (month === 1) onNavigate(year - 1, 12);
    else onNavigate(year, month - 1);
  };

  const next = () => {
    if (month === 12) onNavigate(year + 1, 1);
    else onNavigate(year, month + 1);
  };

  const isPastDate = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isClosedDay = (dateStr: string) => closedDatesSet.has(dateStr);

  const isClosedSchedule = (dateStr: string) => {
    const d = new Date(dateStr);
    const dow = d.getDay();
    const s = scheduleMap.get(dow);
    return s?.is_closed ?? false;
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
        <h3 className="text-lg font-semibold text-slate-800">
          {MONTH_NAMES[month - 1]} {year}
        </h3>
        <button onClick={next} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAY_HEADERS.map((h) => (
          <div key={h} className="text-center text-xs font-medium text-slate-400 py-1">
            {h}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          const closed = isClosedDay(cell.date) || isClosedSchedule(cell.date);
          const past = isPastDate(cell.date);
          const selected = selectedDate === cell.date;
          const disabled = !cell.isCurrentMonth || past || closed;

          let cellClass = 'relative flex flex-col items-center justify-center rounded-lg py-2 text-sm transition-all duration-150 cursor-pointer';

          if (disabled) {
            cellClass += ' text-slate-300 cursor-not-allowed';
          } else if (selected) {
            cellClass += ' bg-sky-500 text-white font-bold shadow-md scale-105';
          } else if (closed) {
            cellClass += ' bg-red-100 text-red-400';
          } else {
            cellClass += ' hover:bg-emerald-50 text-slate-700 font-medium';
          }

          if (cell.isToday && !selected && !disabled) {
            cellClass += ' ring-2 ring-sky-300';
          }

          return (
            <button
              key={i}
              onClick={() => !disabled && onSelectDay(cell.date)}
              className={cellClass}
              disabled={disabled}
            >
              {cell.day}
              {cell.isToday && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-sky-400" />}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-emerald-400" /> Liber</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-amber-400" /> Parțial</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-red-400" /> Rezervat</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-slate-300" /> Indisponibil</span>
      </div>
    </div>
  );
}
