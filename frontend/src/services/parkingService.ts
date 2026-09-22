import { api } from './api';
import { Parking, ParkingSpace, SearchFilters, SpaceStatus } from '../types';

export const parkingService = {
  async getParkings(filters?: SearchFilters): Promise<Parking[]> {
    return api.get<Parking[]>('/parking/', filters);
  },

  async getParkingById(id: number | string): Promise<Parking> {
    return api.get<Parking>(`/parking/${id}/`);
  },

  async getSpaces(parkingId: number | string): Promise<ParkingSpace[]> {
    return api.get<ParkingSpace[]>(`/parking/${parkingId}/spaces/`);
  },

  async toggleFavorite(parkingId: number): Promise<{ is_favorite: boolean; message: string }> {
    return api.post<{ is_favorite: boolean; message: string }>(`/parking/${parkingId}/toggle_favorite/`);
  },

  async getFavorites(): Promise<Array<{ id: number; parking: Parking; created_at: string }>> {
    return api.get<Array<{ id: number; parking: Parking; created_at: string }>>('/parking/favorites/');
  },

  // Admin Actions
  async createParking(data: Partial<Parking>): Promise<Parking> {
    return api.post<Parking>('/parking/', data);
  },

  async updateParking(id: number, data: Partial<Parking>): Promise<Parking> {
    return api.patch<Parking>(`/parking/${id}/`, data);
  },

  async deleteParking(id: number): Promise<void> {
    return api.delete(`/parking/${id}/`);
  },

  async getAllSpaces(parkingId?: number): Promise<ParkingSpace[]> {
    return api.get<ParkingSpace[]>('/parking/spaces/', { parking_id: parkingId });
  },

  async updateSpaceStatus(spaceId: number, status: SpaceStatus): Promise<ParkingSpace> {
    return api.patch<ParkingSpace>(`/parking/spaces/${spaceId}/set_status/`, { status });
  },
};
