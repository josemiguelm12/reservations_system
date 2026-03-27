import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto, UpdateResourceDto, ResourceFilterDto } from './dto';

@Injectable()
export class ResourcesService {
  private readonly logger = new Logger(ResourcesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateResourceDto) {
    const resource = await this.prisma.resource.create({
      data: dto,
      include: {
        schedules: true,
      },
    });

    this.logger.log(`Resource created: ${resource.name}`);
    return resource;
  }

  async findAll(filters: ResourceFilterDto, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: Prisma.ResourceWhereInput = {
      isActive: true,
    };

    if (filters.type) where.type = filters.type;
    if (filters.minCapacity) where.capacity = { gte: filters.minCapacity };
    if (filters.minPrice || filters.maxPrice) {
      where.pricePerHour = {};
      if (filters.minPrice) (where.pricePerHour as any).gte = filters.minPrice;
      if (filters.maxPrice) (where.pricePerHour as any).lte = filters.maxPrice;
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [resources, total] = await Promise.all([
      this.prisma.resource.findMany({
        where,
        skip,
        take: limit,
        include: {
          schedules: {
            where: { isActive: true },
            orderBy: { dayOfWeek: 'asc' },
          },
          _count: {
            select: { reservations: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.resource.count({ where }),
    ]);

    return {
      data: resources,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: {
        schedules: {
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' },
        },
        _count: {
          select: { reservations: true },
        },
      },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return resource;
  }

  async update(id: string, dto: UpdateResourceDto) {
    await this.findOne(id);

    const resource = await this.prisma.resource.update({
      where: { id },
      data: dto,
      include: {
        schedules: true,
      },
    });

    this.logger.log(`Resource updated: ${resource.name}`);
    return resource;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.resource.delete({
      where: { id },
    });

    this.logger.log(`Resource deleted: ${id}`);
    return { message: 'Resource deleted successfully' };
  }
}
