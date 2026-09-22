import React, { createContext, useContext, useState, useEffect } from 'react';
import { parkingService } from '../services/parkingService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface FavoritesContextType {
  favoriteIds: number[];
  isFavorite: (parkingId: number) => boolean;
  toggleFavorite: (parkingId: number) => Promise<void>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadFavorites = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          const favs = await parkingService.getFavorites();
          setFavoriteIds(favs.map((f) => f.parking.id));
        } catch {
          // Silent fallback
        } finally {
          setLoading(false);
        }
      } else {
        setFavoriteIds([]);
      }
    };
    loadFavorites();
  }, [isAuthenticated]);

  const isFavorite = (parkingId: number) => favoriteIds.includes(parkingId);

  const toggleFavorite = async (parkingId: number) => {
    if (!isAuthenticated) {
      toast('Inicia sesión para guardar estacionamientos en favoritos', 'info');
      return;
    }

    const wasFavorite = favoriteIds.includes(parkingId);
    // Optimistic UI update
    setFavoriteIds((prev) =>
      wasFavorite ? prev.filter((id) => id !== parkingId) : [...prev, parkingId]
    );

    try {
      const res = await parkingService.toggleFavorite(parkingId);
      toast(res.message, res.is_favorite ? 'success' : 'info');
    } catch (err: any) {
      // Rollback
      setFavoriteIds((prev) =>
        wasFavorite ? [...prev, parkingId] : prev.filter((id) => id !== parkingId)
      );
      toast(err.message || 'No se pudo actualizar favoritos', 'error');
    }
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites debe usarse dentro de un FavoritesProvider');
  }
  return context;
};
