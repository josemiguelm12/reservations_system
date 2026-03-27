import { z } from 'zod';

// ─── Auth Schemas ────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
});

// ─── Resource Schemas ────────────────────────────────────
export const createResourceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(['COURT', 'ROOM', 'TABLE', 'DESK', 'EQUIPMENT', 'OTHER']),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  pricePerHour: z.number().min(0, 'Price must be positive'),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

// ─── Reservation Schemas ─────────────────────────────────
export const createReservationSchema = z
  .object({
    resourceId: z.string().uuid('Invalid resource'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data) => new Date(data.startTime) < new Date(data.endTime),
    { message: 'Start time must be before end time', path: ['endTime'] },
  );

// ─── Schedule Schemas ────────────────────────────────────
export const createScheduleSchema = z.object({
  resourceId: z.string().uuid(),
  dayOfWeek: z.enum([
    'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY',
    'FRIDAY', 'SATURDAY', 'SUNDAY',
  ]),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time format (HH:mm)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time format (HH:mm)'),
});

// ─── Types ───────────────────────────────────────────────
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
