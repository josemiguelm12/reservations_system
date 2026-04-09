import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import type {
  Resource,
  PaginatedResponse,
  Reservation,
  DashboardStats,
  AvailabilityCheck,
  TimeSlot,
  User,
  Review,
} from '@/lib/types';

/* ═══════════════════════════════════
   RESOURCES
   ═══════════════════════════════════ */

interface ResourceFilters {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
}

export function useResources(filters: ResourceFilters = {}) {
  return useQuery<PaginatedResponse<Resource>>({
    queryKey: ['resources', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));
      if (filters.type) params.set('type', filters.type);
      if (filters.search) params.set('search', filters.search);
      if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
      if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
      if (filters.minCapacity) params.set('minCapacity', String(filters.minCapacity));
      const { data } = await api.get(`/resources?${params}`);
      return data;
    },
  });
}

export function useResource(id: string) {
  return useQuery<Resource>({
    queryKey: ['resources', id],
    queryFn: async () => {
      const { data } = await api.get(`/resources/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<Resource>) => {
      const { data } = await api.post('/resources', body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Recurso creado exitosamente');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al crear recurso');
    },
  });
}

export function useUpdateResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<Resource> & { id: string }) => {
      const { data } = await api.patch(`/resources/${id}`, body);
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['resources'] });
      qc.invalidateQueries({ queryKey: ['resources', vars.id] });
      toast.success('Recurso actualizado');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al actualizar recurso');
    },
  });
}

export function useDeleteResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/resources/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Recurso eliminado');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al eliminar recurso');
    },
  });
}

/* ═══════════════════════════════════
   RESERVATIONS
   ═══════════════════════════════════ */

interface ReservationFilters {
  page?: number;
  limit?: number;
  status?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
}

export function useReservations(filters: ReservationFilters = {}) {
  return useQuery<PaginatedResponse<Reservation>>({
    queryKey: ['reservations', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.set(k, String(v));
      });
      const { data } = await api.get(`/reservations?${params}`);
      return data;
    },
  });
}

export function useReservation(id: string) {
  return useQuery<Reservation>({
    queryKey: ['reservations', id],
    queryFn: async () => {
      const { data } = await api.get(`/reservations/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { resourceId: string; startTime: string; endTime: string; notes?: string }) => {
      const { data } = await api.post('/reservations', body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] });
      qc.invalidateQueries({ queryKey: ['availability'] });
      toast.success('Reserva creada exitosamente');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al crear reserva');
    },
  });
}

export function useCancelReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/reservations/${id}/cancel`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reserva cancelada');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al cancelar reserva');
    },
  });
}

export function useCheckAvailability(resourceId: string, startTime: string, endTime: string) {
  return useQuery<AvailabilityCheck>({
    queryKey: ['availability', resourceId, startTime, endTime],
    queryFn: async () => {
      const params = new URLSearchParams({ resourceId, startTime, endTime });
      const { data } = await api.get(`/reservations/availability?${params}`);
      return data;
    },
    enabled: !!resourceId && !!startTime && !!endTime,
  });
}

export function useResourceSlots(resourceId: string, date: string) {
  return useQuery<TimeSlot[]>({
    queryKey: ['slots', resourceId, date],
    queryFn: async () => {
      const { data } = await api.get(`/reservations/availability/slots/${resourceId}/${date}`);
      return data;
    },
    enabled: !!resourceId && !!date,
  });
}

/* ═══════════════════════════════════
   PAYMENTS
   ═══════════════════════════════════ */

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: async (reservationId: string) => {
      const { data } = await api.post('/payments/create-intent', { reservationId });
      return data as { clientSecret: string; paymentId: string; amount: number };
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al procesar pago');
    },
  });
}

/* ═══════════════════════════════════
   ADMIN RESERVATIONS
   ═══════════════════════════════════ */

export function useAdminReservations(filters: ReservationFilters = {}) {
  return useQuery<PaginatedResponse<Reservation>>({
    queryKey: ['admin-reservations', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.set(k, String(v));
      });
      const { data } = await api.get(`/reservations/admin/all?${params}`);
      return data;
    },
  });
}

export function useUpdateReservationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/reservations/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reservations'] });
      qc.invalidateQueries({ queryKey: ['reservations'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Estado actualizado');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al actualizar estado');
    },
  });
}

/* ═══════════════════════════════════
   USERS (Admin)
   ═══════════════════════════════════ */

export function useUsers(page = 1, limit = 10) {
  return useQuery<PaginatedResponse<User>>({
    queryKey: ['users', page, limit],
    queryFn: async () => {
      const { data } = await api.get(`/users?page=${page}&limit=${limit}`);
      return data;
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; role?: string; isActive?: boolean }) => {
      const { data } = await api.patch(`/users/${id}`, body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario actualizado');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al actualizar usuario');
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { fullName?: string }) => {
      const { data } = await api.patch('/users/profile/update', body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth-user'] });
      toast.success('Perfil actualizado');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al actualizar perfil');
    },
  });
}

/* ═══════════════════════════════════
   STATS (Admin)
   ═══════════════════════════════════ */

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['stats', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/stats/dashboard');
      return data;
    },
  });
}

export function useRevenueByPeriod(period: 'day' | 'week' | 'month' = 'month', months = 6) {
  return useQuery({
    queryKey: ['stats', 'revenue', period, months],
    queryFn: async () => {
      const { data } = await api.get(`/stats/revenue?period=${period}&months=${months}`);
      return data as { period: string; revenue: number; count: number }[];
    },
  });
}

export function useTopResources(limit = 5) {
  return useQuery({
    queryKey: ['stats', 'top-resources', limit],
    queryFn: async () => {
      const { data } = await api.get(`/stats/top-resources?limit=${limit}`);
      return data as { resourceName: string; totalReservations: number; totalRevenue: number }[];
    },
  });
}

export function useReservationTrends(days = 30) {
  return useQuery({
    queryKey: ['stats', 'trends', days],
    queryFn: async () => {
      const { data } = await api.get(`/stats/trends?days=${days}`);
      return data as { date: string; count: number }[];
    },
  });
}

/* ═══════════════════════════════════
   SCHEDULES (Admin)
   ═══════════════════════════════════ */

export function useSchedules(resourceId?: string) {
  return useQuery({
    queryKey: ['schedules', resourceId],
    queryFn: async () => {
      const url = resourceId ? `/schedules?resourceId=${resourceId}` : '/schedules';
      const { data } = await api.get(url);
      return data;
    },
  });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      resourceId: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isActive?: boolean;
    }) => {
      const { data } = await api.post('/schedules', body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Horario creado');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al crear horario');
    },
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/schedules/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Horario eliminado');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al eliminar horario');
    },
  });
}

/* ═══════════════════════════════════
   REVIEWS (Public)
   ═══════════════════════════════════ */

export function useResourceReviews(resourceId: string, page = 1) {
  return useQuery<{ reviews: Review[]; avgRating: number; total: number }>({
    queryKey: ['reviews', resourceId, page],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/resource/${resourceId}?page=${page}&limit=10`);
      return data;
    },
    enabled: !!resourceId,
  });
}
