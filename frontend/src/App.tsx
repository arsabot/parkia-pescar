import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { SearchPage } from './pages/SearchPage';
import { ParkingDetailPage } from './pages/ParkingDetailPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { MyReservationsPage } from './pages/MyReservationsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminParkingsPage } from './pages/admin/AdminParkingsPage';
import { AdminSpacesPage } from './pages/admin/AdminSpacesPage';
import { AdminReservationsPage } from './pages/admin/AdminReservationsPage';

// Protected Route for Admin Role
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Protected Route for Authenticated Users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <FavoritesProvider>
            <AppLayout>
              <Routes>
                {/* Public & Driver Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/parking/:id" element={<ParkingDetailPage />} />
                <Route path="/booking/confirmation/:id" element={<BookingConfirmationPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Driver Protected Routes */}
                <Route
                  path="/my-reservations"
                  element={
                    <ProtectedRoute>
                      <MyReservationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <FavoritesPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/parkings"
                  element={
                    <AdminRoute>
                      <AdminParkingsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/spaces"
                  element={
                    <AdminRoute>
                      <AdminSpacesPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/reservations"
                  element={
                    <AdminRoute>
                      <AdminReservationsPage />
                    </AdminRoute>
                  }
                />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          </FavoritesProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
