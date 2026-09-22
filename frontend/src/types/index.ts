export type UserRole = 'driver' | 'admin';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export type SpaceStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';
export type SpaceType = 'standard' | 'disabled' | 'ev' | 'large';

export interface ParkingSpace {
  id: number;
  parking: number;
  code: string;
  floor: string;
  space_type: SpaceType;
  space_type_display: string;
  status: SpaceStatus;
  status_display: string;
  created_at: string;
}

export interface Parking {
  id: number;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  description: string;
  phone: string;
  price_per_hour: number;
  price_per_day?: number;
  opening_time: string;
  closing_time: string;
  is_24_hours: boolean;
  capacity: number;
  rating: number;
  reviews_count: number;
  is_active: boolean;
  is_covered: boolean;
  has_security: boolean;
  has_ev_charging: boolean;
  has_disabled_access: boolean;
  has_car_wash: boolean;
  has_valet: boolean;
  image_url: string;
  gallery?: string[];
  available_spaces: number;
  total_spaces: number;
  occupancy_rate: number;
  is_favorite: boolean;
  distance_km?: number;
  spaces?: ParkingSpace[];
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Reservation {
  id: number;
  booking_code: string;
  user: number;
  user_name: string;
  user_email: string;
  parking: number;
  parking_name: string;
  parking_address: string;
  parking_city: string;
  parking_phone: string;
  parking_image_url: string;
  parking_latitude: number;
  parking_longitude: number;
  space?: number;
  space_code: string;
  space_floor: string;
  vehicle_plate: string;
  vehicle_model?: string;
  date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  total_price: number;
  status: ReservationStatus;
  status_display: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  user: number;
  user_name: string;
  user_email: string;
  parking: number;
  parking_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface SearchFilters {
  search?: string;
  max_price?: number;
  max_distance?: number;
  is_covered?: boolean;
  has_security?: boolean;
  has_ev_charging?: boolean;
  has_disabled_access?: boolean;
  is_24_hours?: boolean;
  sort_by?: 'recommended' | 'closest' | 'price_asc' | 'price_desc' | 'rating_desc';
  lat?: number;
  lng?: number;
}

export interface AdminKPIs {
  total_reservations: number;
  today_reservations: number;
  active_parkings: number;
  total_parkings: number;
  total_spaces: number;
  occupied_spaces: number;
  occupancy_rate: number;
  total_revenue: number;
  today_revenue: number;
}

export interface AdminDashboardData {
  kpis: AdminKPIs;
  charts: {
    reservations_by_day: Array<{
      date: string;
      day_name: string;
      label: string;
      reservations: number;
      revenue: number;
    }>;
    occupancy_by_hour: Array<{
      hour: string;
      occupancy: number;
      demand: string;
    }>;
    top_parkings: Array<{
      id: number;
      name: string;
      revenue: number;
      reservations_count: number;
      rating: number;
      occupancy_rate: number;
    }>;
    status_distribution: Array<{
      name: string;
      value: number;
      color: string;
    }>;
  };
  recent_reservations: Reservation[];
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}
