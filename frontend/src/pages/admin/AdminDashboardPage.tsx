import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Car, 
  CalendarCheck, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { KPICard } from '../../components/admin/KPICard';
import { Badge } from '../../components/common/Badge';
import { adminService } from '../../services/adminService';
import { AdminDashboardData } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const stats = await adminService.getDashboardStats();
        setData(stats);
      } catch (err) {
        console.error('Error loading admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <AdminSidebar />
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />
                ))}
              </div>
              <div className="h-80 bg-white rounded-3xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { kpis, charts, recent_reservations } = data;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Panel de Control y Estadísticas
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Supervisión en tiempo real de ocupación, reservas e ingresos de los estacionamientos.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <AdminSidebar />

          {/* Main Dashboard Area */}
          <div className="flex-1 space-y-8">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KPICard
                title="Reservas Totales"
                value={kpis.total_reservations}
                subtitle={`Hoy: +${kpis.today_reservations} reservas`}
                icon={CalendarCheck}
                variant="brand"
                trend={{ value: '+18%', isPositive: true }}
              />

              <KPICard
                title="Ocupación Actual"
                value={`${kpis.occupancy_rate}%`}
                subtitle={`${kpis.occupied_spaces} de ${kpis.total_spaces} plazas en uso`}
                icon={Layers}
                variant={kpis.occupancy_rate > 80 ? 'amber' : 'emerald'}
              />

              <KPICard
                title="Ingresos Estimados"
                value={`$${Number(kpis.total_revenue).toLocaleString('es-AR')}`}
                subtitle={`Hoy: $${Number(kpis.today_revenue).toLocaleString('es-AR')}`}
                icon={DollarSign}
                variant="emerald"
                trend={{ value: '+24%', isPositive: true }}
              />

              <KPICard
                title="Garages Activos"
                value={kpis.active_parkings}
                subtitle={`De ${kpis.total_parkings} registrados`}
                icon={Car}
                variant="blue"
              />
            </div>

            {/* Recharts: Row 1 - Daily Evolution & Peak Hours */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              {/* Chart 1: Daily Trend */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Reservas por Día</h3>
                    <p className="text-xs text-slate-400">Evolución de los últimos 7 días</p>
                  </div>
                  <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                    Última semana
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts.reservations_by_day} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day_name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Area type="monotone" dataKey="reservations" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRes)" name="Reservas" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Peak Hours Occupancy */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Demanda por Franja Horaria</h3>
                    <p className="text-xs text-slate-400">Ocupación estimada según hora del día</p>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    Horarios Pico
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.occupancy_by_hour} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="occupancy" fill="#6366f1" radius={[6, 6, 0, 0]} name="Ocupación %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Row 2: Top Parkings & Status Breakdown */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Top Performing Garages (2 cols) */}
              <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 text-base mb-4">Estacionamientos con Mayor Demanda</h3>
                <div className="space-y-3">
                  {charts.top_parkings.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>{p.reservations_count} reservas</span>
                          <span>•</span>
                          <span>{p.rating}★ de valoración</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-sm text-slate-900 block">
                          ${Number(p.revenue).toLocaleString('es-AR')}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600">
                          {p.occupancy_rate}% ocupación
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Distribution Pie Chart (1 col) */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">Estado de Reservas</h3>
                  <p className="text-xs text-slate-400 mb-4">Proporción según estado actual</p>
                </div>

                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.status_distribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {charts.status_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-2 border-t border-slate-100">
                  {charts.status_distribution.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-slate-600 truncate">{s.name}: {s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Recent Reservations Table */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-base">Últimas Reservas Registradas</h3>
                <span className="text-xs text-slate-400">Total: {recent_reservations.length}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3">Código</th>
                      <th className="py-3 px-3">Conductor</th>
                      <th className="py-3 px-3">Estacionamiento</th>
                      <th className="py-3 px-3">Fecha y Hora</th>
                      <th className="py-3 px-3">Plaza</th>
                      <th className="py-3 px-3">Total</th>
                      <th className="py-3 px-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {recent_reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-brand-600">
                          {res.booking_code}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {res.user_name || res.user_email}
                        </td>
                        <td className="py-3 px-3">{res.parking_name}</td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {res.date} ({res.start_time.slice(0, 5)} hs)
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {res.space_code}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          ${Number(res.total_price).toLocaleString('es-AR')}
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={res.status as any}>{res.status_display}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
