import { api } from './api';
import { AdminDashboardData } from '../types';

export const adminService = {
  async getDashboardStats(): Promise<AdminDashboardData> {
    return api.get<AdminDashboardData>('/admin/dashboard/');
  },
};
