import { api } from './api';
import { Reservation, ReservationStatus } from '../types';

export const reservationService = {
  async getReservations(params?: { status?: string; parking_id?: number; search?: string }): Promise<Reservation[]> {
    return api.get<Reservation[]>('/reservations/', params);
  },

  async getReservationById(id: number | string): Promise<Reservation> {
    return api.get<Reservation>(`/reservations/${id}/`);
  },

  async createReservation(data: {
    parking: number;
    space?: number;
    vehicle_plate: string;
    vehicle_model?: string;
    date: string;
    start_time: string;
    end_time: string;
  }): Promise<{ message: string; reservation: Reservation }> {
    return api.post<{ message: string; reservation: Reservation }>('/reservations/', data);
  },

  async cancelReservation(id: number, reason?: string): Promise<{ message: string; reservation: Reservation }> {
    return api.patch<{ message: string; reservation: Reservation }>(`/reservations/${id}/cancel/`, { reason });
  },

  async changeStatus(id: number, status: ReservationStatus): Promise<{ message: string; reservation: Reservation }> {
    return api.patch<{ message: string; reservation: Reservation }>(`/reservations/${id}/change_status/`, { status });
  },

  async checkAvailability(params: {
    parking_id: number;
    date: string;
    start_time: string;
    end_time: string;
  }): Promise<{
    parking_id: number;
    total_spaces: number;
    available_spaces_count: number;
    has_availability: boolean;
    duration_hours: number;
    estimated_price: number;
    spaces: Array<{
      id: number;
      code: string;
      floor: string;
      space_type: string;
      is_available: boolean;
      status: string;
    }>;
  }> {
    return api.get('/reservations/check_availability/', params);
  },
};
