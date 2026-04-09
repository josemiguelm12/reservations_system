import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto, UpdateScheduleDto, CreateScheduleExceptionDto } from './dto';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@ApiTags('schedules')
@Controller('api/schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PARTNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create schedule for a resource (Partner/Admin)' })
  create(
    @Body() dto: CreateScheduleDto,
    @CurrentUser() user: any,
  ) {
    return this.schedulesService.create(dto, user);
  }

  @Get('resource/:resourceId')
  @ApiOperation({ summary: 'Get schedules for a resource (public)' })
  findByResource(@Param('resourceId', ParseUUIDPipe) resourceId: string) {
    return this.schedulesService.findByResource(resourceId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PARTNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update schedule (Owner/Admin)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScheduleDto,
    @CurrentUser() user: any,
  ) {
    return this.schedulesService.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PARTNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete schedule (Owner/Admin)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.schedulesService.remove(id, user);
  }

  // Exceptions
  @Post('exceptions')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PARTNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create schedule exception (Owner/Admin)' })
  createException(
    @Body() dto: CreateScheduleExceptionDto,
    @CurrentUser() user: any,
  ) {
    return this.schedulesService.createException(dto, user);
  }

  @Get('exceptions/:resourceId')
  @ApiOperation({ summary: 'Get schedule exceptions for a resource' })
  getExceptions(@Param('resourceId', ParseUUIDPipe) resourceId: string) {
    return this.schedulesService.getExceptions(resourceId);
  }

  @Delete('exceptions/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PARTNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete schedule exception (Owner/Admin)' })
  removeException(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.schedulesService.removeException(id, user);
  }
}
