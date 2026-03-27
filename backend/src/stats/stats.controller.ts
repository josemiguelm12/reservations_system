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
import { Roles } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@ApiTags('stats')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('api/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics (Admin only)' })
  getDashboardStats() {
    return this.statsService.getDashboardStats();
  }

  @Get('reservations-by-period')
  @ApiOperation({ summary: 'Get reservations grouped by status in a date range' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  getReservationsByPeriod(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statsService.getReservationsByPeriod(startDate, endDate);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue by date range' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  getRevenueByPeriod(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statsService.getRevenueByPeriod(startDate, endDate);
  }

  @Get('top-resources')
  @ApiOperation({ summary: 'Get top reserved resources' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopResources(@Query('limit') limit?: number) {
    return this.statsService.getTopResources(limit || 10);
  }

  @Get('trend')
  @ApiOperation({ summary: 'Get reservation trend over time' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getReservationTrend(@Query('days') days?: number) {
    return this.statsService.getReservationTrend(days || 30);
  }
}
