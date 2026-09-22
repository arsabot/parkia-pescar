import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Heart, Frown } from 'lucide-react';
import { Parking } from '../types';
import { parkingService } from '../services/parkingService';
import { useAuth } from '../context/AuthContext';
import { ParkingCard } from '../components/parking/ParkingCard';
import { EmptyState } from '../components/common/EmptyState';
import { BookingModal } from '../components/reservations/BookingModal';

export const FavoritesPage: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingParking, setBookingParking] = useState<Parking | null>(null);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await parkingService.getFavorites();
      setFavorites(data.map((f) => f.parking));
    } catch (err) {
      console.error('Error fetching favorites', err);
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
      fetchFavorites();
    }
  }, [isAuthenticated, authLoading, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-brand-600" />
            Mis Favoritos
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Tus estacionamientos guardados para un acceso y reserva rápida.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-36 bg-white rounded-3xl animate-pulse" />
            <div className="h-36 bg-white rounded-3xl animate-pulse" />
          </div>
        ) : favorites.length === 0 ? (
          <EmptyState
            icon={<Heart className="w-8 h-8 text-rose-500" />}
            title="Aún no tienes estacionamientos favoritos"
            description="Explora el mapa y haz click en el icono de corazón para guardar tus garages preferidos."
            actionText="Explorar estacionamientos"
            onAction={() => navigate('/search')}
          />
        ) : (
          <div className="space-y-4">
            {favorites.map((parking) => (
              <ParkingCard
                key={parking.id}
                parking={parking}
                onQuickBook={(p) => setBookingParking(p)}
              />
            ))}
          </div>
        )}
      </div>

      {bookingParking && (
        <BookingModal
          isOpen={!!bookingParking}
          onClose={() => setBookingParking(null)}
          parking={bookingParking}
        />
      )}
    </div>
  );
};
