import React from 'react';

interface BadgeProps {
  variant?: 'available' | 'occupied' | 'reserved' | 'maintenance' | 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'info' | 'success';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'info',
  children,
  className = '',
  dot = true,
}) => {
  const styles: Record<string, { bg: string; dotColor: string }> = {
    available: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500' },
    occupied: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dotColor: 'bg-rose-500' },
    reserved: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
    maintenance: { bg: 'bg-slate-100 text-slate-700 border-slate-300', dotColor: 'bg-slate-400' },
    confirmed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500' },
    pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
    cancelled: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dotColor: 'bg-rose-500' },
    completed: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-500' },
    info: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dotColor: 'bg-indigo-500' },
    success: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500' },
  };

  const current = styles[variant] || styles.info;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${current.dotColor} shrink-0 animate-pulse`} />}
      {children}
    </span>
  );
};
