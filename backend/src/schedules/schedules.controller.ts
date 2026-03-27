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
import { Roles } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@ApiTags('schedules')
@Controller('api/schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create schedule for a resource (Admin only)' })
  create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(dto);
  }

  @Get('resource/:resourceId')
  @ApiOperation({ summary: 'Get schedules for a resource (public)' })
  findByResource(@Param('resourceId', ParseUUIDPipe) resourceId: string) {
    return this.schedulesService.findByResource(resourceId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update schedule (Admin only)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete schedule (Admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.schedulesService.remove(id);
  }

  // Exceptions
  @Post('exceptions')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create schedule exception (Admin only)' })
  createException(@Body() dto: CreateScheduleExceptionDto) {
    return this.schedulesService.createException(dto);
  }

  @Get('exceptions/:resourceId')
  @ApiOperation({ summary: 'Get schedule exceptions for a resource' })
  getExceptions(@Param('resourceId', ParseUUIDPipe) resourceId: string) {
    return this.schedulesService.getExceptions(resourceId);
  }

  @Delete('exceptions/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete schedule exception (Admin only)' })
  removeException(@Param('id', ParseUUIDPipe) id: string) {
    return this.schedulesService.removeException(id);
  }
}
