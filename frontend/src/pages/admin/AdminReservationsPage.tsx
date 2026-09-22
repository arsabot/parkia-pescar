import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Search, 
  Filter, 
  MapPin, 
  Car, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw 
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { reservationService } from '../../services/reservationService';
import { parkingService } from '../../services/parkingService';
import { Reservation, Parking, ReservationStatus } from '../../types';

export const AdminReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [parkingFilter, setParkingFilter] = useState<string>('all');

  const { success, error } = useToast();

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (parkingFilter !== 'all') params.parking_id = Number(parkingFilter);
      if (search.trim()) params.search = search.trim();

      const data = await reservationService.getReservations(params);
      setReservations(data);
    } catch (err) {
      console.error('Error fetching reservations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    parkingService.getParkings().then(setParkings).catch(() => {});
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [statusFilter, parkingFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReservations();
  };

  const handleChangeStatus = async (id: number, newStatus: ReservationStatus) => {
    try {
      const res = await reservationService.changeStatus(id, newStatus);
      setReservations((prev) => prev.map((r) => (r.id === id ? res.reservation : r)));
      success(res.message || 'Estado actualizado');
    } catch (err: any) {
      error(err.message || 'Error al cambiar estado');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Historial y Control de Reservas
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Consulta, filtra y modifica el estado de todas las reservas de la plataforma.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchReservations}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Actualizar
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <AdminSidebar />

          <div className="flex-1 space-y-6">
            
            {/* Filter controls */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por código PK-XXXXXX, patente o conductor..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <Button type="submit" variant="primary">
                  Buscar
                </Button>
              </form>

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">Estado:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="confirmed">Confirmadas</option>
                    <option value="completed">Finalizadas</option>
                    <option value="cancelled">Canceladas</option>
                    <option value="pending">Pendientes</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Estacionamiento:</span>
                  <select
                    value={parkingFilter}
                    onChange={(e) => setParkingFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="all">Todos los estacionamientos</option>
                    {parkings.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                    <tr>
                      <th className="py-4 px-4">Código</th>
                      <th className="py-4 px-3">Conductor</th>
                      <th className="py-4 px-3">Estacionamiento</th>
                      <th className="py-4 px-3">Fecha y Hora</th>
                      <th className="py-4 px-3">Plaza / Auto</th>
                      <th className="py-4 px-3">Total</th>
                      <th className="py-4 px-3">Estado</th>
                      <th className="py-4 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          Cargando reservas...
                        </td>
                      </tr>
                    ) : reservations.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          No se encontraron reservas con los filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      reservations.map((res) => (
                        <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-brand-600">
                            {res.booking_code}
                          </td>
                          <td className="py-3 px-3">
                            <strong className="text-slate-900 block">{res.user_name || 'Conductor'}</strong>
                            <span className="text-[11px] text-slate-400">{res.user_email}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-800 line-clamp-1">{res.parking_name}</span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="block font-bold text-slate-900">{res.date}</span>
                            <span className="text-[11px] text-slate-400">
                              {res.start_time.slice(0, 5)} - {res.end_time.slice(0, 5)} hs
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mr-1">
                              {res.space_code}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500">
                              {res.vehicle_plate}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-black text-slate-900">
                            ${Number(res.total_price).toLocaleString('es-AR')}
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant={res.status as any}>{res.status_display}</Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {res.status === 'confirmed' && (
                                <>
                                  <button
                                    onClick={() => handleChangeStatus(res.id, 'completed')}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors"
                                    title="Marcar como finalizada al salir"
                                  >
                                    Finalizar
                                  </button>
                                  <button
                                    onClick={() => handleChangeStatus(res.id, 'cancelled')}
                                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition-colors"
                                    title="Cancelar reserva"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
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
