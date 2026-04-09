import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto, UpdateScheduleDto, CreateScheduleExceptionDto } from './dto';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateScheduleDto, user: { id: string; role: UserRole }) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: dto.resourceId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    this.verifyResourceOwnership(resource, user);

    // Validate times
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    const schedule = await this.prisma.schedule.create({
      data: dto,
      include: { resource: true },
    });

    this.logger.log(`Schedule created for resource ${dto.resourceId}`);
    return schedule;
  }

  async findByResource(resourceId: string) {
    return this.prisma.schedule.findMany({
      where: { resourceId, isActive: true },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async update(id: string, dto: UpdateScheduleDto, user: { id: string; role: UserRole }) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: { resource: true },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');

    this.verifyResourceOwnership(schedule.resource, user);

    if (dto.startTime && dto.endTime && dto.startTime >= dto.endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    return this.prisma.schedule.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, user: { id: string; role: UserRole }) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: { resource: true },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');

    this.verifyResourceOwnership(schedule.resource, user);

    await this.prisma.schedule.delete({ where: { id } });
    return { message: 'Schedule deleted successfully' };
  }

  // Schedule Exceptions (holidays, blocked dates)
  async createException(dto: CreateScheduleExceptionDto, user: { id: string; role: UserRole }) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: dto.resourceId },
    });
    if (!resource) throw new NotFoundException('Resource not found');

    this.verifyResourceOwnership(resource, user);

    return this.prisma.scheduleException.create({
      data: {
        resourceId: dto.resourceId,
        date: new Date(dto.date),
        reason: dto.reason,
      },
    });
  }

  async getExceptions(resourceId: string) {
    return this.prisma.scheduleException.findMany({
      where: { resourceId },
      orderBy: { date: 'asc' },
    });
  }

  async removeException(id: string, user: { id: string; role: UserRole }) {
    const exception = await this.prisma.scheduleException.findUnique({ where: { id } });
    if (!exception) throw new NotFoundException('Exception not found');

    const resource = await this.prisma.resource.findUnique({
      where: { id: exception.resourceId },
    });
    if (resource) {
      this.verifyResourceOwnership(resource, user);
    }

    await this.prisma.scheduleException.delete({ where: { id } });
    return { message: 'Exception deleted successfully' };
  }

  private verifyResourceOwnership(
    resource: { ownerId: string | null },
    user: { id: string; role: UserRole },
  ) {
    if (user.role === 'ADMIN') return;
    if (resource.ownerId !== user.id) {
      throw new ForbiddenException('You can only manage schedules for your own resources');
    }
  }
}
