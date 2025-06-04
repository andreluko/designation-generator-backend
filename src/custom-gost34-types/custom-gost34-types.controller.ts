import {
  Controller, Get, Post, Body, Param, Delete, Put, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import { CustomGost34TypesService } from './custom-gost34-types.service';
import { CreateCustomGost34TypeDto } from './dto/create-custom-gost34-type.dto.ts';
import { UpdateCustomGost34TypeDto } from './dto/update-custom-gost34-type.dto.ts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CustomGost34TypeEntity } from './entities/custom-gost34-type.entity.ts';

@ApiTags('custom-gost34-types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('custom-gost34-types')
export class CustomGost34TypesController {
  constructor(private readonly customGost34TypesService: CustomGost34TypesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new custom GOST 34 document type' })
  @ApiResponse({ status: 201, description: 'Custom type created successfully.', type: CustomGost34TypeEntity })
  @ApiResponse({ status: 400, description: 'Bad Request (validation error).' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 409, description: 'Conflict (code already exists).' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateCustomGost34TypeDto): Promise<CustomGost34TypeEntity> {
    return this.customGost34TypesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all custom GOST 34 document types' })
  @ApiResponse({ status: 200, description: 'List of custom types.', type: [CustomGost34TypeEntity] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(): Promise<CustomGost34TypeEntity[]> {
    return this.customGost34TypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific custom GOST 34 document type by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Custom type details.', type: CustomGost34TypeEntity })
  @ApiResponse({ status: 404, description: 'Custom type not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CustomGost34TypeEntity> {
    return this.customGost34TypesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a custom GOST 34 document type (e.g., name)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Custom type updated successfully.', type: CustomGost34TypeEntity })
  @ApiResponse({ status: 404, description: 'Custom type not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCustomGost34TypeDto,
  ): Promise<CustomGost34TypeEntity> {
    return this.customGost34TypesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a custom GOST 34 document type' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Custom type deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Custom type not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 409, description: 'Conflict (e.g., type is in use).' }) // If you implement usage check
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.customGost34TypesService.remove(id);
  }
}
