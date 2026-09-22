import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ParkingCircle, Sparkles, ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const { login, demoLogin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/search';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Por favor ingresa tu correo y contraseña');
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email, password });
      success(`¡Bienvenido de vuelta, ${res.user.first_name}!`);
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } catch (err: any) {
      error(err.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'driver' | 'admin') => {
    try {
      setDemoLoading(role);
      const res = await demoLogin(role);
      success(`Accediste con la cuenta demo de ${role === 'admin' ? 'Administrador' : 'Conductor'}`);
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/search');
      }
    } catch (err: any) {
      error(err.message || 'Error en login demo');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <ParkingCircle className="w-7 h-7 stroke-[2.5]" />
            </div>
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Iniciar Sesión
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Ingresa a tu cuenta para gestionar tus reservas o estacionamientos.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
          
          {/* Quick Demo Logins Box */}
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 text-center">
              Accesos Demo para pruebas rápidas
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('driver')}
                disabled={!!demoLoading}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:border-brand-500 hover:text-brand-600 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                Conductor Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={!!demoLoading}
                className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 hover:bg-indigo-100 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                Admin Demo
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-3 text-slate-400 text-xs uppercase tracking-wider font-semibold">
              O con tu correo
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full py-3 text-sm font-bold shadow-lg shadow-brand-500/25 mt-2"
              rightIcon={<LogIn className="w-4 h-4" />}
            >
              Iniciar Sesión
            </Button>
          </form>

          {/* Register Link */}
          <div className="text-center pt-6 mt-6 border-t border-slate-100 text-xs text-slate-500">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
              Registrate gratis aquí
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
