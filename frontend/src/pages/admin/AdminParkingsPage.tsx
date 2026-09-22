import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  MapPin, 
  Clock, 
  DollarSign, 
  Layers, 
  AlertTriangle,
  Search
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import { parkingService } from '../../services/parkingService';
import { Parking } from '../../types';

export const AdminParkingsPage: React.FC = () => {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParking, setEditingParking] = useState<Parking | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Parking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error } = useToast();

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'Buenos Aires',
    latitude: -34.6037,
    longitude: -58.3816,
    description: '',
    phone: '',
    price_per_hour: 2000,
    price_per_day: 15000,
    opening_time: '07:00:00',
    closing_time: '23:00:00',
    is_24_hours: false,
    capacity: 25,
    is_active: true,
    is_covered: true,
    has_security: true,
    has_ev_charging: false,
    has_disabled_access: true,
    has_car_wash: false,
    has_valet: false,
    image_url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800',
  });

  const fetchParkings = async () => {
    try {
      setLoading(true);
      const data = await parkingService.getParkings();
      setParkings(data);
    } catch (err) {
      console.error('Error fetching parkings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkings();
  }, []);

  const handleOpenCreate = () => {
    setEditingParking(null);
    setFormData({
      name: '',
      address: '',
      city: 'Buenos Aires',
      latitude: -34.6037,
      longitude: -58.3816,
      description: '',
      phone: '',
      price_per_hour: 2000,
      price_per_day: 15000,
      opening_time: '07:00:00',
      closing_time: '23:00:00',
      is_24_hours: false,
      capacity: 25,
      is_active: true,
      is_covered: true,
      has_security: true,
      has_ev_charging: false,
      has_disabled_access: true,
      has_car_wash: false,
      has_valet: false,
      image_url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Parking) => {
    setEditingParking(p);
    setFormData({
      name: p.name,
      address: p.address,
      city: p.city,
      latitude: p.latitude,
      longitude: p.longitude,
      description: p.description,
      phone: p.phone,
      price_per_hour: Number(p.price_per_hour),
      price_per_day: Number(p.price_per_day || 15000),
      opening_time: p.opening_time,
      closing_time: p.closing_time,
      is_24_hours: p.is_24_hours,
      capacity: p.capacity,
      is_active: p.is_active,
      is_covered: p.is_covered,
      has_security: p.has_security,
      has_ev_charging: p.has_ev_charging,
      has_disabled_access: p.has_disabled_access,
      has_car_wash: p.has_car_wash,
      has_valet: p.has_valet,
      image_url: p.image_url,
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (p: Parking) => {
    try {
      const updated = await parkingService.updateParking(p.id, { is_active: !p.is_active });
      setParkings((prev) => prev.map((item) => (item.id === p.id ? { ...item, is_active: updated.is_active } : item)));
      success(`Estacionamiento ${updated.is_active ? 'activado' : 'desactivado'} correctamente.`);
    } catch (err: any) {
      error(err.message || 'Error al actualizar estado');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingParking) {
        const updated = await parkingService.updateParking(editingParking.id, formData);
        setParkings((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        success('Estacionamiento actualizado correctamente.');
      } else {
        const created = await parkingService.createParking(formData);
        setParkings((prev) => [created, ...prev]);
        success('Nuevo estacionamiento creado exitosamente.');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      error(err.message || 'Error al guardar el estacionamiento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await parkingService.deleteParking(deleteCandidate.id);
      setParkings((prev) => prev.filter((item) => item.id !== deleteCandidate.id));
      success('Estacionamiento eliminado.');
      setDeleteCandidate(null);
    } catch (err: any) {
      error(err.message || 'Error al eliminar');
    }
  };

  const filteredParkings = parkings.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Gestión de Estacionamientos
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Crea, edita, actualiza tarifas y gestiona la disponibilidad de tus garages.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-lg shadow-brand-500/25"
          >
            Nuevo Estacionamiento
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <AdminSidebar />

          <div className="flex-1 space-y-6">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar estacionamientos por nombre o dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
              />
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                    <tr>
                      <th className="py-4 px-4">Estacionamiento</th>
                      <th className="py-4 px-3">Tarifa/h</th>
                      <th className="py-4 px-3">Horario</th>
                      <th className="py-4 px-3">Capacidad</th>
                      <th className="py-4 px-3">Estado</th>
                      <th className="py-4 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {filteredParkings.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image_url || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=100'}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover shrink-0"
                            />
                            <div>
                              <strong className="text-slate-900 block font-bold text-sm">{p.name}</strong>
                              <span className="text-[11px] text-slate-400">{p.address}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-bold text-slate-900 text-sm">
                          ${Number(p.price_per_hour).toLocaleString('es-AR')}
                        </td>

                        <td className="py-3 px-3">
                          {p.is_24_hours ? (
                            <span className="font-bold text-indigo-600">24 Horas</span>
                          ) : (
                            `${p.opening_time.slice(0, 5)} - ${p.closing_time.slice(0, 5)}`
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900">{p.capacity}</span> plazas
                        </td>

                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleActive(p)}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                              p.is_active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {p.is_active ? '✓ Activo' : '✕ Inactivo'}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-2 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteCandidate(p)}
                              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* Modal: Create & Edit Parking */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingParking ? `Editar ${editingParking.name}` : 'Nuevo Estacionamiento'}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nombre del Estacionamiento
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Parkia Centro Premium"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Dirección
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Av. Corrientes 1000"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ciudad
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Buenos Aires"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Latitud
              </label>
              <input
                type="number"
                step="any"
                required
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Longitud
              </label>
              <input
                type="number"
                step="any"
                required
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Precio por Hora ($)
              </label>
              <input
                type="number"
                required
                value={formData.price_per_hour}
                onChange={(e) => setFormData({ ...formData, price_per_hour: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Capacidad de Plazas
              </label>
              <input
                type="number"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hora Apertura
              </label>
              <input
                type="time"
                value={formData.opening_time}
                onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hora Cierre
              </label>
              <input
                type="time"
                value={formData.closing_time}
                onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                URL de Imagen
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Descripción
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Amenities toggles */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Comodidades y Servicios
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.is_24_hours}
                  onChange={(e) => setFormData({ ...formData, is_24_hours: e.target.checked })}
                  className="rounded text-brand-600"
                />
                <span>24 Horas</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.is_covered}
                  onChange={(e) => setFormData({ ...formData, is_covered: e.target.checked })}
                  className="rounded text-brand-600"
                />
                <span>Techado</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.has_security}
                  onChange={(e) => setFormData({ ...formData, has_security: e.target.checked })}
                  className="rounded text-brand-600"
                />
                <span>Seguridad CCTV</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.has_ev_charging}
                  onChange={(e) => setFormData({ ...formData, has_ev_charging: e.target.checked })}
                  className="rounded text-brand-600"
                />
                <span>Carga EV</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.has_disabled_access}
                  onChange={(e) => setFormData({ ...formData, has_disabled_access: e.target.checked })}
                  className="rounded text-brand-600"
                />
                <span>Accesibilidad</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-brand-600"
                />
                <span className="font-bold text-emerald-600">Activo</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="flex-1 font-bold">
              {editingParking ? 'Guardar Cambios' : 'Crear Estacionamiento'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <Modal
          isOpen={!!deleteCandidate}
          onClose={() => setDeleteCandidate(null)}
          title="Confirmar eliminación"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              ¿Estás seguro de que deseas eliminar <strong>{deleteCandidate.name}</strong>? Se borrarán todos sus espacios asociados y reservas históricas.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteCandidate(null)} className="flex-1">
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleDelete} className="flex-1 font-bold">
                Eliminar Definitivamente
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
