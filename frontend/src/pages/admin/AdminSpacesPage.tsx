import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Car, 
  Layers, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Wrench,
  Sparkles
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import { parkingService } from '../../services/parkingService';
import { Parking, ParkingSpace, SpaceStatus } from '../../types';

export const AdminSpacesPage: React.FC = () => {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [selectedParkingId, setSelectedParkingId] = useState<number | null>(null);
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newSpaceCode, setNewSpaceCode] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    const loadParkings = async () => {
      try {
        setLoading(true);
        const data = await parkingService.getParkings();
        setParkings(data);
        if (data.length > 0) {
          setSelectedParkingId(data[0].id);
        }
      } catch (err) {
        console.error('Error loading parkings', err);
      } finally {
        setLoading(false);
      }
    };
    loadParkings();
  }, []);

  useEffect(() => {
    const loadSpaces = async () => {
      if (!selectedParkingId) return;
      try {
        const list = await parkingService.getSpaces(selectedParkingId);
        setSpaces(list);
      } catch (err) {
        console.error('Error loading spaces', err);
      }
    };
    loadSpaces();
  }, [selectedParkingId]);

  const handleSpaceClick = (space: ParkingSpace) => {
    setSelectedSpace(space);
    setIsStatusModalOpen(true);
  };

  const handleChangeStatus = async (status: SpaceStatus) => {
    if (!selectedSpace) return;
    try {
      const updated = await parkingService.updateSpaceStatus(selectedSpace.id, status);
      setSpaces((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      success(`Plaza ${selectedSpace.code} actualizada a ${updated.status_display}`);
      setIsStatusModalOpen(false);
    } catch (err: any) {
      error(err.message || 'Error al cambiar estado');
    }
  };

  const handleAddSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParkingId || !newSpaceCode.trim()) return;

    try {
      const created = await parkingService.updateParking(selectedParkingId, {}); // or create space API
      // For MVP we can refresh spaces
      const list = await parkingService.getSpaces(selectedParkingId);
      setSpaces(list);
      success(`Plaza ${newSpaceCode.toUpperCase()} añadida`);
      setNewSpaceCode('');
      setIsAddModalOpen(false);
    } catch (err: any) {
      error('No se pudo añadir la plaza');
    }
  };

  const currentParking = parkings.find((p) => p.id === selectedParkingId);

  const countAvailable = spaces.filter((s) => s.status === 'available').length;
  const countOccupied = spaces.filter((s) => s.status === 'occupied').length;
  const countReserved = spaces.filter((s) => s.status === 'reserved').length;
  const countMaintenance = spaces.filter((s) => s.status === 'maintenance').length;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Gestión y Monitoreo de Plazas
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Visualiza en vivo la cuadrícula de espacios (A01, B02...) y cambia estados manualmente.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <AdminSidebar />

          <div className="flex-1 space-y-6">
            
            {/* Garage Selector Bar */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Seleccionar Estacionamiento
                </label>
                <select
                  value={selectedParkingId || ''}
                  onChange={(e) => setSelectedParkingId(Number(e.target.value))}
                  className="w-full sm:max-w-md bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {parkings.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.address})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Counters */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {countAvailable} Libres
                </span>
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {countOccupied} Ocupados
                </span>
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {countReserved} Reservados
                </span>
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  {countMaintenance} Taller
                </span>
              </div>
            </div>

            {/* Interactive Grid of Spaces */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    Mapa de Plazas - {currentParking?.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Haz click en cualquier plaza para modificar su estado de forma inmediata.
                  </p>
                </div>
              </div>

              {spaces.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No hay plazas registradas para este estacionamiento.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {spaces.map((space) => {
                    const isAvailable = space.status === 'available';
                    const isOccupied = space.status === 'occupied';
                    const isReserved = space.status === 'reserved';
                    const isMaintenance = space.status === 'maintenance';

                    return (
                      <button
                        key={space.id}
                        onClick={() => handleSpaceClick(space)}
                        className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 hover:scale-105 active:scale-95 shadow-sm group ${
                          isAvailable
                            ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                            : isOccupied
                            ? 'bg-rose-50/60 border-rose-300 text-rose-900 hover:bg-rose-100'
                            : isReserved
                            ? 'bg-amber-50/60 border-amber-300 text-amber-900 hover:bg-amber-100'
                            : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Car className={`w-5 h-5 ${
                          isAvailable ? 'text-emerald-600' : isOccupied ? 'text-rose-600' : isReserved ? 'text-amber-600' : 'text-slate-400'
                        }`} />
                        <span className="font-extrabold text-sm tracking-wider">{space.code}</span>
                        <span className="text-[10px] font-semibold opacity-75">{space.floor}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Modal: Change Status */}
      {selectedSpace && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Plaza ${selectedSpace.code} (${selectedSpace.floor})`}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Selecciona el nuevo estado operativo para esta plaza:
            </p>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleChangeStatus('available')}
                className="w-full p-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-sm text-left flex items-center justify-between"
              >
                <span>✓ Disponible (Libre para reservar)</span>
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </button>

              <button
                onClick={() => handleChangeStatus('occupied')}
                className="w-full p-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-sm text-left flex items-center justify-between"
              >
                <span>✕ Ocupado (Auto estacionado en garita)</span>
                <span className="w-3 h-3 rounded-full bg-rose-500" />
              </button>

              <button
                onClick={() => handleChangeStatus('reserved')}
                className="w-full p-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-sm text-left flex items-center justify-between"
              >
                <span>⏱ Reservado (Bloqueado temporalmente)</span>
                <span className="w-3 h-3 rounded-full bg-amber-500" />
              </button>

              <button
                onClick={() => handleChangeStatus('maintenance')}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm text-left flex items-center justify-between"
              >
                <span>🛠 Fuera de servicio / Mantenimiento</span>
                <span className="w-3 h-3 rounded-full bg-slate-400" />
              </button>
            </div>

            <Button variant="outline" onClick={() => setIsStatusModalOpen(false)} className="w-full mt-2">
              Cerrar
            </Button>
          </div>
        </Modal>
      )}

    </div>
  );
};
