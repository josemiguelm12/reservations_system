import { Injectable, Logger } from '@nestjs/common';
import { ReservationStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers,
      totalResources,
      totalReservations,
      monthlyReservations,
      lastMonthReservations,
      totalRevenue,
      monthlyRevenue,
      pendingReservations,
      activeResources,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.resource.count(),
      this.prisma.reservation.count(),
      this.prisma.reservation.count({
        where: {
          createdAt: { gte: startOfMonth },
        },
      }),
      this.prisma.reservation.count({
        where: {
          createdAt: { gte: startOfLastMonth, lt: startOfMonth },
        },
      }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.COMPLETED },
      }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: PaymentStatus.COMPLETED,
          createdAt: { gte: startOfMonth },
        },
      }),
      this.prisma.reservation.count({
        where: { status: ReservationStatus.PENDING },
      }),
      this.prisma.resource.count({
        where: { isActive: true },
      }),
    ]);

    return {
      totalUsers,
      totalResources,
      activeResources,
      totalReservations,
      monthlyReservations,
      reservationGrowth: lastMonthReservations > 0
        ? ((monthlyReservations - lastMonthReservations) / lastMonthReservations * 100).toFixed(1)
        : '0',
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      pendingReservations,
    };
  }

  async getReservationsByPeriod(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const reservations = await this.prisma.reservation.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: start, lte: end },
      },
      _count: true,
    });

    return reservations.map((r) => ({
      status: r.status,
      count: r._count,
    }));
  }

  async getRevenueByPeriod(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get daily revenue
    const payments = await this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.COMPLETED,
        createdAt: { gte: start, lte: end },
      },
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const revenueByDate: Record<string, number> = {};
    for (const p of payments) {
      const dateKey = p.createdAt.toISOString().split('T')[0];
      revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + p.amount;
    }

    return Object.entries(revenueByDate).map(([date, amount]) => ({
      date,
      amount,
    }));
  }

  async getTopResources(limit = 10) {
    const resources = await this.prisma.reservation.groupBy({
      by: ['resourceId'],
      where: {
        status: {
          in: [ReservationStatus.CONFIRMED, ReservationStatus.COMPLETED],
        },
      },
      _count: true,
      _sum: { totalAmount: true },
      orderBy: { _count: { resourceId: 'desc' } },
      take: limit,
    });

    // Enrich with resource details
    const enriched = await Promise.all(
      resources.map(async (r) => {
        const resource = await this.prisma.resource.findUnique({
          where: { id: r.resourceId },
          select: { id: true, name: true, type: true },
        });
        return {
          resource,
          reservationCount: r._count,
          totalRevenue: r._sum.totalAmount || 0,
        };
      }),
    );

    return enriched;
  }

  async getReservationTrend(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const reservations = await this.prisma.reservation.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const trendByDate: Record<string, { total: number; confirmed: number; cancelled: number }> = {};
    for (const r of reservations) {
      const dateKey = r.createdAt.toISOString().split('T')[0];
      if (!trendByDate[dateKey]) {
        trendByDate[dateKey] = { total: 0, confirmed: 0, cancelled: 0 };
      }
      trendByDate[dateKey].total++;
      if (r.status === ReservationStatus.CONFIRMED || r.status === ReservationStatus.COMPLETED) {
        trendByDate[dateKey].confirmed++;
      }
      if (r.status === ReservationStatus.CANCELLED) {
        trendByDate[dateKey].cancelled++;
      }
    }

    return Object.entries(trendByDate).map(([date, data]) => ({
      date,
      ...data,
    }));
  }
}
