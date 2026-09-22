import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CalendarCheck, 
  Clock, 
  MapPin, 
  Car, 
  Layers, 
  Navigation, 
  XCircle, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Frown,
  Calendar
} from 'lucide-react';
import { Reservation } from '../types';
import { reservationService } from '../services/reservationService';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { CancelReservationModal } from '../components/reservations/CancelReservationModal';

export const MyReservationsPage: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [selectedForCancel, setSelectedForCancel] = useState<Reservation | null>(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getReservations();
      setReservations(data);
    } catch (err) {
      console.error('Error fetching reservations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      fetchReservations();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const activeReservations = reservations.filter(
    (r) => r.status === 'confirmed' || r.status === 'pending'
  );
  const pastReservations = reservations.filter(
    (r) => r.status === 'completed' || r.status === 'cancelled'
  );

  const displayedList = activeTab === 'active' ? activeReservations : pastReservations;
  const nextReservation = activeReservations[0] || null;

  const handleReservationCancelled = (updated: Reservation) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Mis Reservas
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestiona tus plazas de estacionamiento reservadas y revisa tu historial.
          </p>
        </div>

        {/* Featured Card: Next Reservation */}
        {nextReservation && (
          <div className="bg-gradient-to-tr from-slate-950 via-slate-900 to-brand-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
                  Próxima Reserva
                </span>
                <h3 className="text-2xl font-bold text-white mt-2">
                  {nextReservation.parking_name}
                </h3>
                <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                  {nextReservation.parking_address}, {nextReservation.parking_city}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 font-medium block">Código</span>
                <span className="font-mono text-xl font-black text-amber-300">
                  {nextReservation.booking_code}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 mb-6 text-xs">
              <div>
                <span className="text-slate-400 block">Fecha:</span>
                <strong className="text-white text-sm">{nextReservation.date}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Horario:</span>
                <strong className="text-white text-sm">
                  {nextReservation.start_time.slice(0, 5)} - {nextReservation.end_time.slice(0, 5)} hs
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Plaza:</span>
                <strong className="text-emerald-400 text-sm">
                  {nextReservation.space_code} ({nextReservation.space_floor})
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Total estimado:</span>
                <strong className="text-white text-sm">
                  ${Number(nextReservation.total_price).toLocaleString('es-AR')}
                </strong>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${nextReservation.parking_name} ${nextReservation.parking_address}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="emerald" size="sm" leftIcon={<Navigation className="w-4 h-4" />}>
                  Cómo llegar con GPS
                </Button>
              </a>

              <button
                onClick={() => setSelectedForCancel(nextReservation)}
                className="text-xs font-semibold text-rose-300 hover:text-rose-100 transition-colors"
              >
                Cancelar reserva
              </button>
            </div>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'active'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Activas ({activeReservations.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'past'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Historial ({pastReservations.length})
          </button>
        </div>

        {/* List of Reservations */}
        {loading ? (
          <div className="space-y-4">
            <div className="h-32 bg-white rounded-3xl animate-pulse" />
            <div className="h-32 bg-white rounded-3xl animate-pulse" />
          </div>
        ) : displayedList.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck className="w-8 h-8" />}
            title={activeTab === 'active' ? 'No tienes reservas activas' : 'No hay historial de reservas'}
            description="Encuentra un estacionamiento en la zona que deseas y resérvalo con antelación."
            actionText="Buscar estacionamiento"
            onAction={() => navigate('/search')}
          />
        ) : (
          <div className="space-y-4">
            {displayedList.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between gap-5"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      #{res.booking_code}
                    </span>
                    <Badge variant={res.status as any}>{res.status_display}</Badge>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900">{res.parking_name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                    {res.parking_address}, {res.parking_city}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-700 pt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-600" />
                      {res.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      {res.start_time.slice(0, 5)} - {res.end_time.slice(0, 5)} hs
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-brand-600" />
                      Plaza: <strong>{res.space_code}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-brand-600" />
                      {res.vehicle_plate}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-400 font-medium block">Total</span>
                    <span className="text-lg font-black text-slate-900">
                      ${Number(res.total_price).toLocaleString('es-AR')}
                    </span>
                  </div>

                  {res.status === 'confirmed' && (
                    <button
                      onClick={() => setSelectedForCancel(res)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Cancel Modal Instance */}
      {selectedForCancel && (
        <CancelReservationModal
          isOpen={!!selectedForCancel}
          onClose={() => setSelectedForCancel(null)}
          reservation={selectedForCancel}
          onCancelled={handleReservationCancelled}
        />
      )}
    </div>
  );
};
