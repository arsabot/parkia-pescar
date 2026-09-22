import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Copy, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  Layers, 
  Navigation, 
  ArrowRight,
  Download,
  Share2
} from 'lucide-react';
import { Reservation } from '../types';
import { reservationService } from '../services/reservationService';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

export const BookingConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { success } = useToast();

  const [reservation, setReservation] = useState<Reservation | null>(
    (location.state as any)?.reservation || null
  );
  const [loading, setLoading] = useState(!reservation);

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (!reservation && id) {
      reservationService.getReservationById(id)
        .then((data) => {
          setReservation(data);
          setLoading(false);
        })
        .catch(() => {
          navigate('/my-reservations');
        });
    }
  }, [id, reservation, navigate]);

  const copyCode = () => {
    if (reservation?.booking_code) {
      navigator.clipboard.writeText(reservation.booking_code);
      success('Código de reserva copiado al portapapeles');
    }
  };

  if (loading || !reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${reservation.parking_name} ${reservation.parking_address}`
  )}`;

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
        
        {/* Top Success Banner */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-scale-in">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            ¡Reserva Confirmada!
          </h1>
          <p className="text-slate-500 text-sm">
            Tu lugar ya está reservado y garantizado. Guarda este comprobante.
          </p>
        </div>

        {/* Digital Boarding Pass / Ticket Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative">
          
          {/* Top Header of Ticket */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-brand-950 text-white p-6 sm:p-7">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-brand-300 font-bold block">
                  Código de Reserva
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-2xl sm:text-3xl font-black tracking-wider text-amber-300">
                    {reservation.booking_code}
                  </span>
                  <button
                    onClick={copyCode}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                    title="Copiar código"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Confirmada
              </span>
            </div>

            <h3 className="text-lg font-bold text-white line-clamp-1">{reservation.parking_name}</h3>
            <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              {reservation.parking_address}, {reservation.parking_city}
            </p>
          </div>

          {/* Perforated Divider Visual */}
          <div className="relative flex items-center justify-between px-4 -my-3 z-10">
            <div className="w-6 h-6 rounded-full bg-slate-100 -ml-7 shadow-inner" />
            <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
            <div className="w-6 h-6 rounded-full bg-slate-100 -mr-7 shadow-inner" />
          </div>

          {/* Ticket Details Body */}
          <div className="p-6 sm:p-7 space-y-6 bg-white">
            <div className="grid grid-cols-2 gap-4">
              
              <div>
                <span className="text-xs text-slate-400 font-medium block">Fecha</span>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-4 h-4 text-brand-600" />
                  {reservation.date}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium block">Horario</span>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-4 h-4 text-brand-600" />
                  {reservation.start_time.slice(0, 5)} - {reservation.end_time.slice(0, 5)} hs
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium block">Plaza asignada</span>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Layers className="w-4 h-4 text-brand-600" />
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {reservation.space_code} ({reservation.space_floor})
                  </span>
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium block">Vehículo / Patente</span>
                <span className="text-sm font-bold font-mono text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Car className="w-4 h-4 text-brand-600" />
                  {reservation.vehicle_plate}
                </span>
              </div>

            </div>

            {/* Total Price Bar */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Total Estimado ({reservation.total_hours} hs)</span>
                <span className="text-[11px] text-emerald-600 font-semibold">Pago directo en garita/salida</span>
              </div>
              <span className="text-2xl font-black text-slate-900">
                ${Number(reservation.total_price).toLocaleString('es-AR')}
              </span>
            </div>

            {/* Actions Inside Ticket */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="secondary" className="w-full" leftIcon={<Navigation className="w-4 h-4" />}>
                  Cómo llegar (GPS)
                </Button>
              </a>

              <Link to="/my-reservations" className="flex-1">
                <Button variant="primary" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Ver mis reservas
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer helper */}
        <div className="text-center">
          <Link
            to="/search"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
          >
            ← Buscar otro estacionamiento
          </Link>
        </div>

      </div>
    </div>
  );
};
