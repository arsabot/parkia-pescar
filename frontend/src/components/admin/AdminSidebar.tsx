import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  Grid, 
  CalendarCheck, 
  TrendingUp, 
  Settings, 
  ShieldCheck 
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const links = [
    { to: '/admin', label: 'Panel General', icon: LayoutDashboard, end: true },
    { to: '/admin/parkings', label: 'Estacionamientos', icon: Car },
    { to: '/admin/spaces', label: 'Gestión de Plazas', icon: Grid },
    { to: '/admin/reservations', label: 'Historial de Reservas', icon: CalendarCheck },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white rounded-3xl border border-slate-100 p-4 shadow-sm shrink-0">
      <div className="flex items-center gap-3 px-3 py-4 mb-3 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-slate-900">Admin Hub</h4>
          <span className="text-[11px] font-semibold text-emerald-600">Sistema en línea</span>
        </div>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
