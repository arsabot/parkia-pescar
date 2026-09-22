import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Heart, 
  ArrowRight, 
  Car, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { Parking } from '../../types';
import { useFavorites } from '../../context/FavoritesContext';
import { RatingStars } from './RatingStars';
import { AmenityBadge } from './AmenityBadge';
import { Button } from '../common/Button';

interface ParkingCardProps {
  parking: Parking;
  isSelected?: boolean;
  onHover?: (parkingId: number | null) => void;
  onQuickBook?: (parking: Parking) => void;
}

export const ParkingCard: React.FC<ParkingCardProps> = ({
  parking,
  isSelected = false,
  onHover,
  onQuickBook,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(parking.id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isHighOccupancy = parking.available_spaces <= 3 && parking.available_spaces > 0;
  const isFull = parking.available_spaces === 0;

  return (
    <div
      onMouseEnter={() => onHover && onHover(parking.id)}
      onMouseLeave={() => onHover && onHover(null)}
      className={`group relative bg-white rounded-3xl border transition-all duration-300 p-4 sm:p-5 flex flex-col sm:flex-row gap-5 shadow-sm hover:shadow-xl ${
        isSelected
          ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-brand-500/10'
          : 'border-slate-100 hover:border-slate-200'
      }`}
    >
      {/* Image & Badges */}
      <div className="relative w-full sm:w-56 h-48 sm:h-auto rounded-2xl overflow-hidden shrink-0 bg-slate-100">
        <img
          src={parking.image_url || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=500'}
          alt={parking.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(parking.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:text-rose-500 shadow-md transition-all hover:scale-110 active:scale-90"
          title={favorited ? 'Eliminar de favoritos' : 'Guardar en favoritos'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              favorited ? 'fill-rose-500 text-rose-500' : ''
            }`}
          />
        </button>

        {/* 24 Hours / Hours Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white border border-white/20">
            <Clock className="w-3 h-3 text-brand-400" />
            {parking.is_24_hours ? 'Abierto 24hs' : `${parking.opening_time.slice(0, 5)} - ${parking.closing_time.slice(0, 5)}`}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Top meta: Location & Distance */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-1">{parking.city}</span>
            </div>
            {parking.distance_km !== undefined && (
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                a {parking.distance_km} km
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/parking/${parking.id}`} className="block">
            <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 mb-1">
              {parking.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 line-clamp-1 mb-3">{parking.address}</p>

          {/* Rating */}
          <div className="mb-3">
            <RatingStars rating={parking.rating} reviewsCount={parking.reviews_count} size="sm" />
          </div>

          {/* Amenities tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {parking.is_covered && <AmenityBadge type="covered" />}
            {parking.has_security && <AmenityBadge type="security" />}
            {parking.has_ev_charging && <AmenityBadge type="ev" />}
            {parking.has_disabled_access && <AmenityBadge type="disabled" />}
            {parking.has_car_wash && <AmenityBadge type="wash" />}
          </div>
        </div>

        {/* Bottom bar: Pricing, Availability and CTA */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Tarifa por hora</span>
            <span className="text-xl font-black text-slate-900">
              {formatCurrency(parking.price_per_hour)}
            </span>
          </div>

          {/* Availability pill */}
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <span
                className={`text-xs font-bold inline-flex items-center gap-1 ${
                  isFull
                    ? 'text-rose-600'
                    : isHighOccupancy
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {isFull ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" /> Completo
                  </>
                ) : isHighOccupancy ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" /> ¡Últimos {parking.available_spaces} lugares!
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> {parking.available_spaces} libres
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link to={`/parking/${parking.id}`}>
                <Button variant="outline" size="sm">
                  Ver detalle
                </Button>
              </Link>
              {onQuickBook && !isFull && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onQuickBook(parking)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Reservar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
