import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { StatsService } from './stats.service';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@ApiTags('stats')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  // ── Admin endpoints ──

  @Get('dashboard')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get dashboard statistics (Admin only)' })
  getDashboardStats() {
    return this.statsService.getDashboardStats();
  }

  @Get('reservations-by-period')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get reservations grouped by status in a date range (Admin)' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  getReservationsByPeriod(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statsService.getReservationsByPeriod(startDate, endDate);
  }

  @Get('revenue')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get revenue by date range (Admin)' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  getRevenueByPeriod(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statsService.getRevenueByPeriod(startDate, endDate);
  }

  @Get('top-resources')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get top reserved resources (Admin)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopResources(@Query('limit') limit?: number) {
    return this.statsService.getTopResources(limit || 10);
  }

  @Get('trend')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get reservation trend over time (Admin)' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getReservationTrend(@Query('days') days?: number) {
    return this.statsService.getReservationTrend(days || 30);
  }

  // ── Partner endpoints ──

  @Get('partner/dashboard')
  @Roles(UserRole.PARTNER)
  @ApiOperation({ summary: 'Get dashboard statistics for current partner' })
  getPartnerDashboard(@CurrentUser() user: any) {
    return this.statsService.getDashboardStats(user.id);
  }

  @Get('partner/reservations-by-period')
  @Roles(UserRole.PARTNER)
  @ApiOperation({ summary: 'Get partner reservations grouped by status in a date range' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  getPartnerReservationsByPeriod(
    @CurrentUser() user: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statsService.getReservationsByPeriod(startDate, endDate, user.id);
  }

  @Get('partner/revenue')
  @Roles(UserRole.PARTNER)
  @ApiOperation({ summary: 'Get partner revenue by date range' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  getPartnerRevenueByPeriod(
    @CurrentUser() user: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statsService.getRevenueByPeriod(startDate, endDate, user.id);
  }

  @Get('partner/top-resources')
  @Roles(UserRole.PARTNER)
  @ApiOperation({ summary: 'Get partner top reserved resources' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getPartnerTopResources(
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
  ) {
    return this.statsService.getTopResources(limit || 10, user.id);
  }

  @Get('partner/trend')
  @Roles(UserRole.PARTNER)
  @ApiOperation({ summary: 'Get partner reservation trend over time' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getPartnerReservationTrend(
    @CurrentUser() user: any,
    @Query('days') days?: number,
  ) {
    return this.statsService.getReservationTrend(days || 30, user.id);
  }
}
