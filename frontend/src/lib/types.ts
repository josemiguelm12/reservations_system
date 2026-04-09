// ─── User Types ──────────────────────────────────────────
export type UserRole = 'ADMIN' | 'PARTNER' | 'CLIENT';

export interface PartnerProfile {
  id: string;
  userId: string;
  businessName: string;
  description?: string;
  logoUrl?: string;
  phone?: string;
  address?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  partnerProfile?: PartnerProfile;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// ─── Resource Types ──────────────────────────────────────
export type ResourceType = 'COURT' | 'ROOM' | 'TABLE' | 'DESK' | 'EQUIPMENT' | 'OTHER';

export interface Resource {
  id: string;
  name: string;
  description?: string;
  type: ResourceType;
  capacity: number;
  pricePerHour: number;
  imageUrl?: string;
  location?: string;
  amenities?: string[];
  ownerId?: string;
  owner?: Pick<User, 'id' | 'fullName'> & { partnerProfile?: PartnerProfile };
  isActive: boolean;
  createdAt: string;
  schedules?: Schedule[];
  reviews?: Review[];
  avgRating?: number;
  reviewCount?: number;
  _count?: { reservations: number; reviews: number };
}

// ─── Schedule Types ──────────────────────────────────────
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface Schedule {
  id: string;
  resourceId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface ScheduleException {
  id: string;
  resourceId: string;
  date: string;
  reason?: string;
}

// ─── Reservation Types ───────────────────────────────────
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Reservation {
  id: string;
  userId: string;
  resourceId: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  resource?: Resource;
  user?: Pick<User, 'id' | 'email' | 'fullName'>;
  payment?: Payment;
}

// ─── Payment Types ───────────────────────────────────────
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  reservationId: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentId?: string;
  createdAt: string;
}

// ─── Review Types ────────────────────────────────────────
export interface Review {
  id: string;
  resourceId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'fullName'>;
  resource?: Pick<Resource, 'id' | 'name'>;
}

// ─── Stats Types ─────────────────────────────────────────
export interface DashboardStats {
  totalUsers: number;
  totalResources: number;
  activeResources: number;
  totalReservations: number;
  monthlyReservations: number;
  reservationGrowth: string;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingReservations: number;
}

export interface RevenueData {
  date: string;
  amount: number;
}

export interface TrendData {
  date: string;
  total: number;
  confirmed: number;
  cancelled: number;
}

export interface TopResource {
  resource: { id: string; name: string; type: ResourceType };
  reservationCount: number;
  totalRevenue: number;
}

// ─── Pagination ──────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Availability ────────────────────────────────────────
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
}

export interface AvailabilityCheck {
  available: boolean;
  conflicts: Array<{
    id: string;
    startTime: string;
    endTime: string;
    status: string;
  }>;
}
