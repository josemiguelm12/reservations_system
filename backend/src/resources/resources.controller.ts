import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ResourcesService } from './resources.service';
import { CreateResourceDto, UpdateResourceDto, ResourceFilterDto } from './dto';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@ApiTags('resources')
@Controller('api/resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PARTNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new resource (Partner/Admin)' })
  create(
    @Body() dto: CreateResourceDto,
    @CurrentUser() user: any,
  ) {
    return this.resourcesService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all resources (public)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'minCapacity', required: false, type: Number })
  findAll(@Query() filters: ResourceFilterDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    return this.resourcesService.findAll(filters, page, limit);
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my resources (Partner only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findMyResources(
    @CurrentUser('id') userId: string,
    @Query() filters: ResourceFilterDto,
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    return this.resourcesService.findByOwner(userId, filters, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get resource by ID (public)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.resourcesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PARTNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update resource (Owner/Admin)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateResourceDto,
    @CurrentUser() user: any,
  ) {
    return this.resourcesService.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PARTNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete resource (Owner/Admin)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.resourcesService.remove(id, user);
  }
}
