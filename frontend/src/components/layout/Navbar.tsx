import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Compass, 
  Bookmark, 
  CalendarCheck, 
  LayoutDashboard, 
  Car, 
  Grid, 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X, 
  ShieldAlert,
  ParkingCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout, demoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const handleQuickDemo = async (role: 'driver' | 'admin') => {
    await demoLogin(role);
    setUserDropdownOpen(false);
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/search');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <ParkingCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-950 via-slate-800 to-brand-700 bg-clip-text text-transparent">
                PARKIA
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
                Mobility
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {!isAdmin ? (
              <>
                <Link
                  to="/search"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/search')
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  Buscar
                </Link>

                <Link
                  to="/my-reservations"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/my-reservations')
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  Mis Reservas
                </Link>

                <Link
                  to="/favorites"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/favorites')
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  Favoritos
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/admin')
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <Link
                  to="/admin/parkings"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/admin/parkings')
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  Estacionamientos
                </Link>

                <Link
                  to="/admin/spaces"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/admin/spaces')
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  Espacios
                </Link>

                <Link
                  to="/admin/reservations"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/admin/reservations')
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  Reservas
                </Link>
              </>
            )}
          </nav>

          {/* User / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Demo Logins for easy MVP testing */}
                <div className="hidden xl:flex items-center gap-1.5 mr-2">
                  <button
                    onClick={() => handleQuickDemo('driver')}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors flex items-center gap-1"
                    title="Entrar rápido con cuenta de conductor demo"
                  >
                    <Sparkles className="w-3 h-3 text-brand-600" />
                    Demo Conductor
                  </button>
                  <button
                    onClick={() => handleQuickDemo('admin')}
                    className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium transition-colors flex items-center gap-1"
                    title="Entrar rápido con cuenta de administrador demo"
                  >
                    <ShieldAlert className="w-3 h-3 text-indigo-600" />
                    Demo Admin
                  </button>
                </div>

                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Registrarse
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pl-3 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all focus:outline-none"
                >
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <span className="text-[10px] font-semibold text-brand-600 uppercase tracking-wider">
                      {isAdmin ? 'Administrador' : 'Conductor'}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm shadow-inner">
                    {user?.first_name ? user.first_name[0] : 'U'}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-scale-in z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Sesión iniciada como</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      {isAdmin ? (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <LayoutDashboard className="w-4 h-4 text-brand-600" />
                          Panel de Control
                        </Link>
                      ) : (
                        <>
                          <Link
                            to="/my-reservations"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <CalendarCheck className="w-4 h-4 text-brand-600" />
                            Mis Reservas
                          </Link>
                          <Link
                            to="/favorites"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Bookmark className="w-4 h-4 text-brand-600" />
                            Mis Favoritos
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      {/* Switch role demo helper */}
                      <button
                        onClick={() => handleQuickDemo(isAdmin ? 'driver' : 'admin')}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Cambiar a rol {isAdmin ? 'Conductor' : 'Administrador'}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-lg">
          <nav className="flex flex-col gap-1">
            {!isAdmin ? (
              <>
                <Link
                  to="/search"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Compass className="w-5 h-5 text-brand-600" />
                  Buscar Estacionamientos
                </Link>
                <Link
                  to="/my-reservations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <CalendarCheck className="w-5 h-5 text-brand-600" />
                  Mis Reservas
                </Link>
                <Link
                  to="/favorites"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Bookmark className="w-5 h-5 text-brand-600" />
                  Favoritos
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <LayoutDashboard className="w-5 h-5 text-brand-600" />
                  Dashboard
                </Link>
                <Link
                  to="/admin/parkings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Car className="w-5 h-5 text-brand-600" />
                  Estacionamientos
                </Link>
                <Link
                  to="/admin/spaces"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Grid className="w-5 h-5 text-brand-600" />
                  Espacios
                </Link>
                <Link
                  to="/admin/reservations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <CalendarCheck className="w-5 h-5 text-brand-600" />
                  Reservas
                </Link>
              </>
            )}
          </nav>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {!isAuthenticated ? (
              <>
                <div className="grid grid-cols-2 gap-2 pb-2">
                  <button
                    onClick={() => {
                      handleQuickDemo('driver');
                      setMobileMenuOpen(false);
                    }}
                    className="p-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 text-center"
                  >
                    Demo Conductor
                  </button>
                  <button
                    onClick={() => {
                      handleQuickDemo('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="p-2 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-700 text-center"
                  >
                    Demo Admin
                  </button>
                </div>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Registrarse
                  </Button>
                </Link>
              </>
            ) : (
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-sm font-bold text-slate-900">{user?.full_name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <Button variant="danger" onClick={handleLogout} className="w-full">
                  Cerrar Sesión
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
