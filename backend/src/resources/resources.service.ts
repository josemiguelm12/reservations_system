import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto, UpdateResourceDto, ResourceFilterDto } from './dto';

@Injectable()
export class ResourcesService {
  private readonly logger = new Logger(ResourcesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateResourceDto, user: { id: string; role: UserRole }) {
    const resource = await this.prisma.resource.create({
      data: {
        ...dto,
        ownerId: user.role === 'ADMIN' ? dto.ownerId ?? user.id : user.id,
      },
      include: {
        schedules: true,
        owner: {
          select: { id: true, fullName: true, partnerProfile: true },
        },
      },
    });

    this.logger.log(`Resource created: ${resource.name} by ${user.id}`);
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
        { owner: { partnerProfile: { businessName: { contains: filters.search, mode: 'insensitive' } } } },
      ];
    }

    const [resources, total] = await Promise.all([
      this.prisma.resource.findMany({
        where,
        skip,
        take: limit,
        include: {
          owner: {
            select: { id: true, fullName: true, partnerProfile: true },
          },
          schedules: {
            where: { isActive: true },
            orderBy: { dayOfWeek: 'asc' },
          },
          _count: {
            select: { reservations: true, reviews: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.resource.count({ where }),
    ]);

    // Compute avg rating for each resource
    const resourceIds = resources.map((r) => r.id);
    const ratings = await this.prisma.review.groupBy({
      by: ['resourceId'],
      where: { resourceId: { in: resourceIds } },
      _avg: { rating: true },
      _count: { rating: true },
    });
    const ratingMap = new Map(
      ratings.map((r) => [r.resourceId, { avg: r._avg.rating, count: r._count.rating }]),
    );

    const data = resources.map((r) => ({
      ...r,
      avgRating: ratingMap.get(r.id)?.avg ?? null,
      reviewCount: ratingMap.get(r.id)?.count ?? 0,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByOwner(ownerId: string, filters: ResourceFilterDto, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: Prisma.ResourceWhereInput = { ownerId };

    if (filters.type) where.type = filters.type;
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
          schedules: { where: { isActive: true }, orderBy: { dayOfWeek: 'asc' } },
          _count: { select: { reservations: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.resource.count({ where }),
    ]);

    return {
      data: resources,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, fullName: true, partnerProfile: true },
        },
        schedules: {
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' },
        },
        reviews: {
          include: {
            user: { select: { id: true, fullName: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { reservations: true, reviews: true },
        },
      },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    // Compute avg rating
    const agg = await this.prisma.review.aggregate({
      where: { resourceId: id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      ...resource,
      avgRating: agg._avg.rating ?? null,
      reviewCount: agg._count.rating,
    };
  }

  async update(id: string, dto: UpdateResourceDto, user: { id: string; role: UserRole }) {
    const resource = await this.findOne(id);
    this.verifyOwnership(resource, user);

    const updated = await this.prisma.resource.update({
      where: { id },
      data: dto,
      include: {
        schedules: true,
        owner: {
          select: { id: true, fullName: true, partnerProfile: true },
        },
      },
    });

    this.logger.log(`Resource updated: ${updated.name}`);
    return updated;
  }

  async remove(id: string, user: { id: string; role: UserRole }) {
    const resource = await this.findOne(id);
    this.verifyOwnership(resource, user);

    await this.prisma.resource.delete({ where: { id } });

    this.logger.log(`Resource deleted: ${id}`);
    return { message: 'Resource deleted successfully' };
  }

  private verifyOwnership(
    resource: { ownerId?: string | null },
    user: { id: string; role: UserRole },
  ) {
    if (user.role === 'ADMIN') return;
    if (resource.ownerId !== user.id) {
      throw new ForbiddenException('You can only manage your own resources');
    }
  }
}
