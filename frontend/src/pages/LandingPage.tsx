import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Car, 
  ArrowRight, 
  CheckCircle2, 
  Star,
  Users,
  Smartphone,
  TrendingUp,
  Building2
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { ParkingCard } from '../components/parking/ParkingCard';
import { BookingModal } from '../components/reservations/BookingModal';
import { parkingService } from '../services/parkingService';
import { Parking } from '../types';

export const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredParkings, setFeaturedParkings] = useState<Parking[]>([]);
  const [selectedBookingParking, setSelectedBookingParking] = useState<Parking | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const list = await parkingService.getParkings();
        setFeaturedParkings(list.slice(0, 3));
      } catch (err) {
        console.error('Error loading featured parkings', err);
      }
    };
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          navigate(`/search?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&located=true`);
        },
        () => {
          setIsLocating(false);
          // Default fallback to center
          navigate(`/search?lat=-34.6037&lng=-58.3816`);
        }
      );
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-brand-950 via-slate-900 to-slate-900 text-white">
        
        {/* Glow decorative blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-brand-300 mb-6 shadow-inner animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>La plataforma #1 en reservas de estacionamiento inteligente</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-none mb-6">
              Encontrá tu lugar para estacionar <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">antes de llegar.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Evita dar vueltas en la ciudad. Compara tarifas, consulta disponibilidad en tiempo real y reserva tu plaza segura en menos de 1 minuto.
            </p>

            {/* Search Box Card */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-3xl shadow-2xl border border-white/20 max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3 text-slate-900"
            >
              <div className="flex-1 flex items-center gap-3 px-3 w-full">
                <MapPin className="w-5 h-5 text-brand-600 shrink-0" />
                <input
                  type="text"
                  placeholder="¿A dónde vas? (Ej: Obelisco, Palermo, Recoleta...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleUseLocation}
                  disabled={isLocating}
                  className="p-3 sm:p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0 flex items-center justify-center font-semibold text-xs gap-1.5 w-full sm:w-auto"
                  title="Usar mi ubicación actual"
                >
                  <Navigation className={`w-4 h-4 text-brand-600 ${isLocating ? 'animate-spin' : ''}`} />
                  <span className="sm:hidden">Cerca de mí</span>
                </button>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold shadow-lg shadow-brand-600/30"
                  rightIcon={<Search className="w-4 h-4" />}
                >
                  Buscar
                </Button>
              </div>
            </form>

            {/* Quick trust metrics */}
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg mx-auto text-slate-400 text-xs font-medium">
              <div className="flex flex-col items-center">
                <span className="text-xl font-extrabold text-white">+10</span>
                <span>Garages activos</span>
              </div>
              <div className="flex flex-col items-center border-x border-slate-800">
                <span className="text-xl font-extrabold text-emerald-400">100%</span>
                <span>Lugar asegurado</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-extrabold text-white">4.9★</span>
                <span>Satisfacción</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Flujo Simple
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            ¿Cómo funciona PARKIA?
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Tres sencillos pasos para estacionar sin estrés ni demoras.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all text-center relative group">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-black text-xl mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Busca tu destino</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Ingresa una dirección o utiliza tu geolocalización para descubrir los estacionamientos más cercanos y comparar tarifas en el mapa.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all text-center relative group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Elige fecha y plaza</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Selecciona tu franja horaria y tu espacio preferido (A01, B02...). El sistema bloquea tu lugar de forma garantizada.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all text-center relative group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Llega y estaciona</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Muestra tu código de reserva <span className="font-mono font-bold text-slate-900">PK-XXXXXX</span> al ingresar y disfruta de tu estadía sin ticket de papel.
            </p>
          </div>

        </div>
      </section>

      {/* 3. ESTACIONAMIENTOS DESTACADOS */}
      {featuredParkings.length > 0 && (
        <section className="py-16 bg-slate-100/70 border-y border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                  Ubicaciones Top
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  Estacionamientos Populares
                </h2>
                <p className="text-slate-500 text-sm">
                  Espacios verificados con la mejor valoración y seguridad 24 horas.
                </p>
              </div>

              <Link to="/search">
                <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Ver todos en el mapa
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {featuredParkings.map((p) => (
                <ParkingCard
                  key={p.id}
                  parking={p}
                  onQuickBook={(parking) => setSelectedBookingParking(parking)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. BENEFICIOS Y PROPUESTA DE VALOR */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ¿Por qué PARKIA?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight leading-tight">
              La forma inteligente de moverse en la ciudad.
            </h2>
            <p className="text-slate-500 text-base mt-4 mb-8 leading-relaxed">
              Basta de gastar combustible y perder 20 minutos buscando dónde dejar el auto. Con Parkia tienes el control en tu teléfono.
            </p>

            <div className="space-y-4">
              {[
                { title: 'Ahorro de tiempo y combustible', desc: 'Conduce directo a tu plaza asignada sin dar vueltas innecesarias.' },
                { title: 'Transparencia total de tarifas', desc: 'Precios claros por hora y por estadía sin sorpresas ni sobrecargos.' },
                { title: 'Cancelación 100% gratuita', desc: '¿Cambiaste de planes? Cancela con un solo click desde tu panel.' },
                { title: 'Servicios para vehículos ecológicos', desc: 'Filtra fácilmente garages con estaciones de carga para autos eléctricos.' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Showcase Box */}
          <div className="bg-gradient-to-tr from-brand-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 text-brand-300 text-xs font-bold uppercase">
                <Car className="w-5 h-5 text-emerald-400" />
                <span>Ticket Digital Instantáneo</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Reserva confirmada con código único PK-XXXXXX
              </h3>

              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Estacionamiento:</span>
                  <strong className="text-white">Parkia Obelisco Premium</strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Plaza Asignada:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold">A-04 (PB)</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-white/10 pt-2">
                  <span className="text-slate-300">Código de Acceso:</span>
                  <span className="font-mono font-bold text-base text-amber-300 tracking-wider">PK-892401</span>
                </div>
              </div>

              <Link to="/search">
                <Button variant="emerald" className="w-full py-3.5 font-bold shadow-lg shadow-emerald-600/30">
                  Explorar Estacionamientos Ahora
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 5. B2B ESTACIONAMIENTOS ADHERIDOS */}
      <section id="beneficios-b2b" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950 px-3 py-1 rounded-full border border-indigo-800">
              Para Propietarios de Garages
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">
              Digitaliza y maximiza los ingresos de tu estacionamiento
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Únete a la red PARKIA. Gestiona plazas en tiempo real, controla ocupación y atrae a miles de conductores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
              <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h4 className="font-bold text-white mb-1">Aumenta tu Ocupación</h4>
              <p className="text-xs text-slate-400">Reduce plazas vacías en horarios valle con reservas anticipadas.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
              <Building2 className="w-8 h-8 text-brand-400 mx-auto mb-3" />
              <h4 className="font-bold text-white mb-1">Panel de Control en Vivo</h4>
              <p className="text-xs text-slate-400">Modifica tarifas, horarios y estados de plazas (A01, B02) con 1 click.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
              <ShieldCheck className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
              <h4 className="font-bold text-white mb-1">Sin Inversión en Hardware</h4>
              <p className="text-xs text-slate-400">No necesitas sensores caros. Funciona directo desde la app web.</p>
            </div>
          </div>

          <div className="text-center">
            <Link to="/admin">
              <Button variant="primary" size="lg" className="px-8 font-bold">
                Acceder al Panel de Administración
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Booking Modal Instance if triggered from landing page */}
      {selectedBookingParking && (
        <BookingModal
          isOpen={!!selectedBookingParking}
          onClose={() => setSelectedBookingParking(null)}
          parking={selectedBookingParking}
        />
      )}

    </div>
  );
};
