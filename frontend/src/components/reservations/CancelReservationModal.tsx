import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Reservation } from '../../types';
import { reservationService } from '../../services/reservationService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface CancelReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onCancelled: (updated: Reservation) => void;
}

export const CancelReservationModal: React.FC<CancelReservationModalProps> = ({
  isOpen,
  onClose,
  reservation,
  onCancelled,
}) => {
  const [reason, setReason] = useState('Cambio de itinerario / Planes cancelados');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  if (!reservation) return null;

  const handleCancel = async () => {
    try {
      setLoading(true);
      const finalReason = reason === 'Otro' ? customReason : reason;
      const res = await reservationService.cancelReservation(reservation.id, finalReason);
      success('Reserva cancelada correctamente.');
      onCancelled(res.reservation);
      onClose();
    } catch (err: any) {
      error(err.message || 'No se pudo cancelar la reserva.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-rose-600">
          <AlertTriangle className="w-5 h-5" />
          <span>Cancelar Reserva #{reservation.booking_code}</span>
        </div>
      }
      maxWidth="md"
    >
      <div className="space-y-5">
        <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-800 leading-relaxed">
          ¿Estás seguro de que deseas cancelar tu reserva en <strong>{reservation.parking_name}</strong> para el día <strong>{reservation.date}</strong> a las <strong>{reservation.start_time.slice(0, 5)} hs</strong>?
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Motivo de cancelación
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-2"
          >
            <option value="Cambio de itinerario / Planes cancelados">Cambio de itinerario / Planes cancelados</option>
            <option value="Encontré otro lugar más cercano">Encontré otro lugar más cercano</option>
            <option value="Error al seleccionar fecha u horario">Error al seleccionar fecha u horario</option>
            <option value="Otro">Otro motivo</option>
          </select>

          {reason === 'Otro' && (
            <textarea
              placeholder="Especifica el motivo..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Cancelación gratuita sin cargos de penalización.</span>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Volver
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={loading}
            onClick={handleCancel}
            className="flex-1"
          >
            Confirmar Cancelación
          </Button>
        </div>
      </div>
    </Modal>
  );
};
