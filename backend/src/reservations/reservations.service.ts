import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateReservationDto,
  UpdateReservationStatusDto,
  ReservationFilterDto,
} from './dto';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a reservation with transactional concurrency control.
   * Uses Prisma interactive transaction to prevent double bookings.
   */
  async create(userId: string, dto: CreateReservationDto) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    // Basic validation
    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Allow 5 minutes of tolerance to avoid timezone/clock skew issues
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (startTime < fiveMinutesAgo) {
      throw new BadRequestException('Cannot create reservations in the past');
    }

    // Minimum 30 min, maximum 8 hours
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    if (durationHours < 0.5) {
      throw new BadRequestException('Minimum reservation duration is 30 minutes');
    }
    if (durationHours > 8) {
      throw new BadRequestException('Maximum reservation duration is 8 hours');
    }

    // Execute within a serializable transaction to prevent race conditions
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify resource exists and is active
      const resource = await tx.resource.findUnique({
        where: { id: dto.resourceId },
      });

      if (!resource || !resource.isActive) {
        throw new NotFoundException('Resource not found or inactive');
      }

      // 2. Check for schedule exceptions (holidays)
      const exceptionDate = new Date(startTime);
      exceptionDate.setUTCHours(0, 0, 0, 0);
      const nextDay = new Date(exceptionDate);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);

      const exception = await tx.scheduleException.findFirst({
        where: {
          resourceId: dto.resourceId,
          date: {
            gte: exceptionDate,
            lt: nextDay,
          },
        },
      });

      if (exception) {
        throw new BadRequestException(
          `Resource is not available on this date: ${exception.reason || 'Blocked'}`,
        );
      }

      // 3. Critical: Check for overlapping reservations (conflict detection)
      // Uses the composite index on (resourceId, startTime, endTime)
      const conflicting = await tx.reservation.findFirst({
        where: {
          resourceId: dto.resourceId,
          status: {
            in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
          },
          // Overlap detection: two intervals overlap if start1 < end2 AND start2 < end1
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } },
          ],
        },
      });

      if (conflicting) {
        throw new ConflictException(
          'Time slot is already reserved. Please choose a different time.',
        );
      }

      // 4. Calculate total amount
      const totalAmount = parseFloat((durationHours * resource.pricePerHour).toFixed(2));

      // 5. Create the reservation
      const reservation = await tx.reservation.create({
        data: {
          userId,
          resourceId: dto.resourceId,
          startTime,
          endTime,
          totalAmount,
          notes: dto.notes,
          status: ReservationStatus.PENDING,
        },
        include: {
          resource: {
            select: { id: true, name: true, type: true, pricePerHour: true },
          },
          user: {
            select: { id: true, email: true, fullName: true },
          },
        },
      });

      this.logger.log(`Reservation created: ${reservation.id} by user ${userId}`);

      // 6. Emit event for notifications (decoupled)
      this.eventEmitter.emit('reservation.created', {
        reservation,
        user: reservation.user,
        resource: reservation.resource,
      });

      return reservation;
    }, {
      // Serializable isolation for maximum safety against race conditions
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 10000,
    });
  }

  async findAll(filters: ReservationFilterDto, page = 1, limit = 10, userId?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.ReservationWhereInput = {};

    if (userId) where.userId = userId;
    if (filters.status) where.status = filters.status;
    if (filters.resourceId) where.resourceId = filters.resourceId;

    if (filters.startDate || filters.endDate) {
      where.startTime = {};
      if (filters.startDate) where.startTime.gte = new Date(filters.startDate);
      if (filters.endDate) where.startTime.lte = new Date(filters.endDate);
    }

    const [reservations, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        skip,
        take: limit,
        include: {
          resource: {
            select: { id: true, name: true, type: true, imageUrl: true, pricePerHour: true },
          },
          user: {
            select: { id: true, email: true, fullName: true },
          },
          payment: {
            select: { id: true, status: true, amount: true },
          },
        },
        orderBy: { startTime: 'desc' },
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return {
      data: reservations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        resource: true,
        user: {
          select: { id: true, email: true, fullName: true },
        },
        payment: true,
      },
    });

    if (!reservation) throw new NotFoundException('Reservation not found');
    return reservation;
  }

  async updateStatus(id: string, dto: UpdateReservationStatusDto, userId?: string) {
    const reservation = await this.findOne(id);

    // Validate state transitions
    const validTransitions: Record<string, string[]> = {
      [ReservationStatus.PENDING]: [ReservationStatus.CONFIRMED, ReservationStatus.CANCELLED],
      [ReservationStatus.CONFIRMED]: [ReservationStatus.CANCELLED, ReservationStatus.COMPLETED],
      [ReservationStatus.CANCELLED]: [],
      [ReservationStatus.COMPLETED]: [],
    };

    if (!validTransitions[reservation.status]?.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${reservation.status} to ${dto.status}`,
      );
    }

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status: dto.status },
      include: {
        resource: { select: { id: true, name: true, type: true } },
        user: { select: { id: true, email: true, fullName: true } },
      },
    });

    // Emit events
    if (dto.status === ReservationStatus.CONFIRMED) {
      this.eventEmitter.emit('reservation.confirmed', { reservation: updated });
    } else if (dto.status === ReservationStatus.CANCELLED) {
      this.eventEmitter.emit('reservation.cancelled', { reservation: updated });
    }

    this.logger.log(`Reservation ${id} status updated to ${dto.status}`);
    return updated;
  }

  async cancel(id: string, userId: string) {
    const reservation = await this.findOne(id);

    if (reservation.userId !== userId) {
      throw new BadRequestException('You can only cancel your own reservations');
    }

    return this.updateStatus(id, { status: ReservationStatus.CANCELLED }, userId);
  }

  /**
   * Check availability for a resource in a given time range.
   * Returns existing reservations in that range.
   */
  async checkAvailability(resourceId: string, startTime: string, endTime: string) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const conflicting = await this.prisma.reservation.findMany({
      where: {
        resourceId,
        status: {
          in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        },
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } },
        ],
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
      },
      orderBy: { startTime: 'asc' },
    });

    return {
      available: conflicting.length === 0,
      conflicts: conflicting,
    };
  }

  /**
   * Get all reservations for a resource on a given date.
   * Used for the availability calendar.
   */
  async getResourceDaySlots(resourceId: string, date: string) {
    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const reservations = await this.prisma.reservation.findMany({
      where: {
        resourceId,
        status: {
          in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        },
        AND: [
          { startTime: { lt: dayEnd } },
          { endTime: { gt: dayStart } },
        ],
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
      },
      orderBy: { startTime: 'asc' },
    });

    return reservations;
  }
}
