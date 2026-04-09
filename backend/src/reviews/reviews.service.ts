import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto, ReviewFilterDto } from './dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    // Verify resource exists
    const resource = await this.prisma.resource.findUnique({
      where: { id: dto.resourceId },
    });
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    // Check user has a completed reservation for this resource
    const completedReservation = await this.prisma.reservation.findFirst({
      where: {
        userId,
        resourceId: dto.resourceId,
        status: 'COMPLETED',
      },
    });
    if (!completedReservation) {
      throw new BadRequestException(
        'You can only review resources where you have a completed reservation',
      );
    }

    // Check if user already reviewed this resource
    const existingReview = await this.prisma.review.findUnique({
      where: { resourceId_userId: { resourceId: dto.resourceId, userId } },
    });
    if (existingReview) {
      throw new ConflictException('You have already reviewed this resource');
    }

    const review = await this.prisma.review.create({
      data: {
        resourceId: dto.resourceId,
        userId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        user: { select: { id: true, fullName: true } },
        resource: { select: { id: true, name: true } },
      },
    });

    this.logger.log(`Review created for resource ${dto.resourceId} by user ${userId}`);
    return review;
  }

  async findByResource(resourceId: string, filters: ReviewFilterDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [reviews, total, agg] = await Promise.all([
      this.prisma.review.findMany({
        where: { resourceId },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { resourceId } }),
      this.prisma.review.aggregate({
        where: { resourceId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        avgRating: agg._avg.rating ?? null,
        reviewCount: agg._count.rating,
      },
    };
  }

  async update(id: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only edit your own reviews');
    }

    return this.prisma.review.update({
      where: { id },
      data: dto,
      include: {
        user: { select: { id: true, fullName: true } },
      },
    });
  }

  async remove(id: string, user: { id: string; role: string }) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (user.role !== 'ADMIN' && review.userId !== user.id) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.review.delete({ where: { id } });
    this.logger.log(`Review ${id} deleted by ${user.id}`);
    return { message: 'Review deleted successfully' };
  }
}
