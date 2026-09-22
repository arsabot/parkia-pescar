import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Parking } from '../../types';
import { Star, Shield, Zap, ArrowRight, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LeafletMapProps {
  parkings: Parking[];
  selectedParkingId?: number | null;
  onSelectParking?: (parking: Parking) => void;
  userCoords?: { lat: number; lng: number } | null;
  center?: [number, number];
  zoom?: number;
}

// Controller component to smoothly move map center
const MapController: React.FC<{
  center: [number, number];
  zoom: number;
  selectedParking?: Parking | null;
}> = ({ center, zoom, selectedParking }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedParking) {
      map.flyTo([selectedParking.latitude, selectedParking.longitude], 16, {
        duration: 0.8,
      });
    }
  }, [selectedParking, map]);

  return null;
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  parkings,
  selectedParkingId,
  onSelectParking,
  userCoords,
  center = [-34.6037, -58.3816], // Default Buenos Aires
  zoom = 13,
}) => {
  const selectedParking = parkings.find((p) => p.id === selectedParkingId);

  // Custom marker icon helper
  const createCustomIcon = (parking: Parking, isSelected: boolean) => {
    const formattedPrice = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(parking.price_per_hour);

    const html = `
      <div class="custom-pin-inner ${isSelected ? 'active' : ''}">
        <span>${formattedPrice}</span>
      </div>
    `;

    return L.divIcon({
      className: 'custom-map-pin',
      html,
      iconSize: [60, 30],
      iconAnchor: [30, 15],
      popupAnchor: [0, -15],
    });
  };

  const userIcon = L.divIcon({
    className: 'custom-user-pin-wrapper',
    html: `<div class="custom-user-pin"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapController
          center={center}
          zoom={zoom}
          selectedParking={selectedParking}
        />

        {/* User location pin */}
        {userCoords && (
          <Marker position={[userCoords.lat, userCoords.lng]} icon={userIcon}>
            <Popup>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 p-1">
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                Tu ubicación actual
              </div>
            </Popup>
          </Marker>
        )}

        {/* Parking lot pins */}
        {parkings.map((p) => {
          const isSelected = p.id === selectedParkingId;
          return (
            <Marker
              key={p.id}
              position={[p.latitude, p.longitude]}
              icon={createCustomIcon(p, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onSelectParking) onSelectParking(p);
                },
              }}
            >
              <Popup className="custom-popup" maxWidth={300} minWidth={240}>
                <div className="p-1">
                  {p.image_url && (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-28 object-cover rounded-xl mb-2.5"
                    />
                  )}
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1 mb-1">{p.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1 mb-2">{p.address}</p>

                  <div className="flex items-center justify-between text-xs font-semibold mb-3">
                    <span className="text-brand-600 font-bold text-sm">
                      ${Number(p.price_per_hour).toLocaleString('es-AR')}/h
                    </span>
                    <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {p.rating}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-emerald-600 font-medium">
                      {p.available_spaces > 0 ? `${p.available_spaces} libres` : 'Completo'}
                    </span>
                    <Link
                      to={`/parking/${p.id}`}
                      className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700"
                    >
                      Ver detalle <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
