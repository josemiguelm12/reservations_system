import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prisma: any;
  let eventEmitter: EventEmitter2;

  const mockResource = {
    id: 'resource-1',
    name: 'Test Court',
    type: 'COURT',
    capacity: 4,
    pricePerHour: 25.0,
    isActive: true,
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    fullName: 'Test User',
  };

  beforeEach(async () => {
    const mockPrisma = {
      resource: {
        findUnique: jest.fn(),
      },
      reservation: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      scheduleException: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    prisma = module.get<PrismaService>(PrismaService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  describe('create', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(12, 0, 0, 0);

    const validDto = {
      resourceId: 'resource-1',
      startTime: tomorrow.toISOString(),
      endTime: tomorrowEnd.toISOString(),
    };

    it('should reject if start time is after end time', async () => {
      const dto = {
        ...validDto,
        startTime: tomorrowEnd.toISOString(),
        endTime: tomorrow.toISOString(),
      };

      await expect(service.create('user-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject if start time is in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const pastEnd = new Date(pastDate);
      pastEnd.setHours(pastEnd.getHours() + 2);

      const dto = {
        ...validDto,
        startTime: pastDate.toISOString(),
        endTime: pastEnd.toISOString(),
      };

      await expect(service.create('user-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject if duration is less than 30 minutes', async () => {
      const shortEnd = new Date(tomorrow);
      shortEnd.setMinutes(shortEnd.getMinutes() + 15);

      const dto = {
        ...validDto,
        endTime: shortEnd.toISOString(),
      };

      await expect(service.create('user-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject if duration is more than 8 hours', async () => {
      const longEnd = new Date(tomorrow);
      longEnd.setHours(longEnd.getHours() + 9);

      const dto = {
        ...validDto,
        endTime: longEnd.toISOString(),
      };

      await expect(service.create('user-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should detect conflicting reservations in transaction', async () => {
      const mockReservation = {
        id: 'res-1',
        userId: 'user-1',
        resourceId: 'resource-1',
        startTime: tomorrow,
        endTime: tomorrowEnd,
        status: 'PENDING',
        totalAmount: 50,
        user: mockUser,
        resource: mockResource,
      };

      // Mock transaction callback - simulate the transaction
      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          resource: {
            findUnique: jest.fn().mockResolvedValue(mockResource),
          },
          scheduleException: {
            findFirst: jest.fn().mockResolvedValue(null),
          },
          reservation: {
            findFirst: jest.fn().mockResolvedValue({ id: 'existing-res' }), // Conflict!
            create: jest.fn(),
          },
        };
        return callback(tx);
      });

      await expect(service.create('user-1', validDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create reservation successfully when no conflicts', async () => {
      const mockCreated = {
        id: 'res-new',
        userId: 'user-1',
        resourceId: 'resource-1',
        startTime: tomorrow,
        endTime: tomorrowEnd,
        status: 'PENDING',
        totalAmount: 50,
        user: mockUser,
        resource: mockResource,
      };

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          resource: {
            findUnique: jest.fn().mockResolvedValue(mockResource),
          },
          scheduleException: {
            findFirst: jest.fn().mockResolvedValue(null),
          },
          reservation: {
            findFirst: jest.fn().mockResolvedValue(null), // No conflict
            create: jest.fn().mockResolvedValue(mockCreated),
          },
        };
        return callback(tx);
      });

      const result = await service.create('user-1', validDto);
      expect(result).toBeDefined();
      expect(result.id).toBe('res-new');
    });
  });

  describe('checkAvailability', () => {
    it('should return available when no conflicts', async () => {
      prisma.reservation.findMany.mockResolvedValue([]);

      const result = await service.checkAvailability(
        'resource-1',
        new Date().toISOString(),
        new Date(Date.now() + 3600000).toISOString(),
      );

      expect(result.available).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });

    it('should return unavailable when conflicts exist', async () => {
      prisma.reservation.findMany.mockResolvedValue([
        { id: 'conflict-1', startTime: new Date(), endTime: new Date(), status: 'CONFIRMED' },
      ]);

      const result = await service.checkAvailability(
        'resource-1',
        new Date().toISOString(),
        new Date(Date.now() + 3600000).toISOString(),
      );

      expect(result.available).toBe(false);
      expect(result.conflicts.length).toBeGreaterThan(0);
    });
  });
});
