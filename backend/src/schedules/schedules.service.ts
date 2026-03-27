import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto, UpdateScheduleDto, CreateScheduleExceptionDto } from './dto';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateScheduleDto) {
    // Verify resource exists
    const resource = await this.prisma.resource.findUnique({
      where: { id: dto.resourceId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

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

  async update(id: string, dto: UpdateScheduleDto) {
    const schedule = await this.prisma.schedule.findUnique({ where: { id } });
    if (!schedule) throw new NotFoundException('Schedule not found');

    if (dto.startTime && dto.endTime && dto.startTime >= dto.endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    return this.prisma.schedule.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const schedule = await this.prisma.schedule.findUnique({ where: { id } });
    if (!schedule) throw new NotFoundException('Schedule not found');

    await this.prisma.schedule.delete({ where: { id } });
    return { message: 'Schedule deleted successfully' };
  }

  // Schedule Exceptions (holidays, blocked dates)
  async createException(dto: CreateScheduleExceptionDto) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: dto.resourceId },
    });
    if (!resource) throw new NotFoundException('Resource not found');

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

  async removeException(id: string) {
    await this.prisma.scheduleException.delete({ where: { id } });
    return { message: 'Exception deleted successfully' };
  }
}
