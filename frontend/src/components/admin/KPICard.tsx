import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'brand' | 'emerald' | 'amber' | 'blue';
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'brand',
  trend,
}) => {
  const variantStyles = {
    brand: { iconBg: 'bg-brand-50 text-brand-600 border-brand-100', borderHover: 'hover:border-brand-300' },
    emerald: { iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100', borderHover: 'hover:border-emerald-300' },
    amber: { iconBg: 'bg-amber-50 text-amber-600 border-amber-100', borderHover: 'hover:border-amber-300' },
    blue: { iconBg: 'bg-blue-50 text-blue-600 border-blue-100', borderHover: 'hover:border-blue-300' },
  };

  const current = variantStyles[variant];

  return (
    <div className={`bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all ${current.borderHover}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${current.iconBg} shadow-inner`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
        {trend && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-md ${
              trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-400 font-medium mt-1">{subtitle}</p>}
    </div>
  );
};
