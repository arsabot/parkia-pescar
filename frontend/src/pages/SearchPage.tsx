import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Navigation, 
  SlidersHorizontal, 
  Map as MapIcon, 
  List, 
  Car, 
  Frown 
} from 'lucide-react';
import { Parking, SearchFilters } from '../types';
import { parkingService } from '../services/parkingService';
import { LeafletMap } from '../components/map/LeafletMap';
import { ParkingCard } from '../components/parking/ParkingCard';
import { FilterSidebar } from '../components/parking/FilterSidebar';
import { ParkingCardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { BookingModal } from '../components/reservations/BookingModal';
import { Button } from '../components/common/Button';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const initialSearch = searchParams.get('q') || '';
  const initialLat = searchParams.get('lat') ? Number(searchParams.get('lat')) : undefined;
  const initialLng = searchParams.get('lng') ? Number(searchParams.get('lng')) : undefined;

  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedParkingId, setSelectedParkingId] = useState<number | null>(null);
  const [activeBookingParking, setActiveBookingParking] = useState<Parking | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // View mode for mobile (list or map)
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState<SearchFilters>({
    search: initialSearch,
    lat: initialLat,
    lng: initialLng,
    sort_by: 'recommended',
    max_price: undefined,
    max_distance: undefined,
    is_covered: undefined,
    has_security: undefined,
    has_ev_charging: undefined,
    has_disabled_access: undefined,
    is_24_hours: undefined,
  });

  const loadParkings = async () => {
    try {
      setLoading(true);
      const data = await parkingService.getParkings(filters);
      setParkings(data);
    } catch (err) {
      console.error('Error al cargar estacionamientos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParkings();
  }, [filters]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchTerm.trim() }));
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setFilters((prev) => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            sort_by: 'closest',
          }));
        },
        () => {
          setIsLocating(false);
          // Fallback to Buenos Aires center
          setFilters((prev) => ({
            ...prev,
            lat: -34.6037,
            lng: -58.3816,
            sort_by: 'closest',
          }));
        }
      );
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({
      search: '',
      sort_by: 'recommended',
    });
  };

  const userCoords = useMemo(() => {
    if (filters.lat && filters.lng) {
      return { lat: filters.lat, lng: filters.lng };
    }
    return null;
  }, [filters.lat, filters.lng]);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 flex flex-col">
      
      {/* Top Search Bar & Controls */}
      <div className="bg-white border-b border-slate-200 sticky top-16 sm:top-20 z-30 px-4 sm:px-6 lg:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1">
              <MapPin className="w-4 h-4 text-brand-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por barrio, calle o nombre (ej: Palermo, Obelisco...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
              />
            </div>

            <Button type="submit" variant="primary" size="md" className="shrink-0">
              <Search className="w-4 h-4" />
            </Button>

            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0"
              title="Centrar en mi ubicación"
            >
              <Navigation className={`w-4 h-4 text-brand-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Mi ubicación</span>
            </button>
          </form>

          {/* Controls: Filter modal toggle + Mobile view switch */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-brand-600" />
              Filtros
            </button>

            {/* Mobile View Switcher (List vs Map) */}
            <div className="lg:hidden flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === 'list' || viewMode === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Lista
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                Mapa
              </button>
            </div>

            <div className="hidden lg:block text-xs font-semibold text-slate-500">
              Mostrando <strong className="text-slate-900">{parkings.length}</strong> estacionamientos
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        
        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="lg:hidden mb-6 animate-fade-in">
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* Desktop Left Column: Filters Sidebar (3 cols) */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="sticky top-40 space-y-4">
              <FilterSidebar
                filters={filters}
                onChange={setFilters}
                onReset={handleResetFilters}
              />
            </div>
          </div>

          {/* Center Column: Results List (5 cols on xl, or 8 cols without map) */}
          <div
            className={`space-y-4 ${
              viewMode === 'map' ? 'hidden lg:block' : 'block'
            } lg:col-span-8 xl:col-span-5`}
          >
            {loading ? (
              <>
                <ParkingCardSkeleton />
                <ParkingCardSkeleton />
                <ParkingCardSkeleton />
              </>
            ) : parkings.length === 0 ? (
              <EmptyState
                icon={<Frown className="w-8 h-8" />}
                title="No encontramos estacionamientos"
                description="Intenta ajustar los filtros de precio o distancia, o busca por otra dirección."
                actionText="Restablecer filtros"
                onAction={handleResetFilters}
              />
            ) : (
              parkings.map((p) => (
                <ParkingCard
                  key={p.id}
                  parking={p}
                  isSelected={p.id === selectedParkingId}
                  onHover={(id) => setSelectedParkingId(id)}
                  onQuickBook={(parking) => setActiveBookingParking(parking)}
                />
              ))
            )}
          </div>

          {/* Right Column: Sticky Interactive Leaflet Map (4 cols on xl, or full on mobile map mode) */}
          <div
            className={`h-[450px] lg:h-[calc(100vh-14rem)] sticky top-36 ${
              viewMode === 'list' ? 'hidden lg:block' : 'block'
            } lg:col-span-8 xl:col-span-4 lg:hidden xl:block`}
          >
            <LeafletMap
              parkings={parkings}
              selectedParkingId={selectedParkingId}
              onSelectParking={(p) => setSelectedParkingId(p.id)}
              userCoords={userCoords}
            />
          </div>

        </div>
      </div>

      {/* Booking Modal Instance */}
      {activeBookingParking && (
        <BookingModal
          isOpen={!!activeBookingParking}
          onClose={() => setActiveBookingParking(null)}
          parking={activeBookingParking}
        />
      )}

    </div>
  );
};
