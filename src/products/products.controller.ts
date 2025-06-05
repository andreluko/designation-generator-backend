import {
  Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto.ts';
import { UpdateProductCommentDto } from './dto/update-product-comment.dto.ts';
import { ProductQueryDto } from './dto/product-query.dto.ts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ProductEntity } from './entities/product.entity';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new product/system' })
  @ApiResponse({ status: 201, description: 'Product registered successfully.', type: ProductEntity })
  @ApiResponse({ status: 400, description: 'Bad Request (validation error).' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 409, description: 'Conflict (e.g., product name or designation already exists).' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto): Promise<ProductEntity> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all registered products/systems with filtering, sorting, and pagination' })
  @ApiQuery({ name: 'standard', required: false, enum: ['ЕСПД', 'ЕСКД', 'ГОСТ 34'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'e.g., productName, registrationDate, standard' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc', 'ASC', 'DESC'] })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Paginated list of products.', 
    schema: { // Custom schema for paginated response
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductEntity' }
        },
        total: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAll(@Query() queryDto: ProductQueryDto): Promise<{ data: ProductEntity[], total: number }> {
    return this.productsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific product/system by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Product details.', type: ProductEntity })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductEntity> {
    return this.productsService.findOne(id);
  }

  @Put(':id/comment')
  @ApiOperation({ summary: 'Update comment for a product/system' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully.', type: ProductEntity })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  updateComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductCommentDto: UpdateProductCommentDto,
  ): Promise<ProductEntity> {
    return this.productsService.updateComment(id, updateProductCommentDto);
  }
  
  // updateBitrixTaskId is internal to backend logic, usually not a direct public PUT endpoint
  // It's updated via the integrations/bitrix24/product-task POST endpoint.

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product/system' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 409, description: 'Conflict (e.g., product has associated documents).' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
