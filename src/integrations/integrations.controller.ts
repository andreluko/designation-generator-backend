import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Bitrix24Service } from './bitrix24/bitrix24.service';
import { CreateBitrixTaskDto, BitrixTaskResponseDto } from './dto/create-bitrix-task.dto';
import { ProductsService } from '../products/products.service';

@ApiTags('integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly bitrix24Service: Bitrix24Service,
    private readonly productsService: ProductsService, // To fetch product details
  ) {}

  @Post('bitrix24/product-task')
  @ApiOperation({ summary: 'Create a task in Bitrix24 for a registered product' })
  @ApiResponse({ status: 201, description: 'Bitrix24 task created successfully.', type: BitrixTaskResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., product already has a task, validation error).' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error or Bitrix24 API error.' })
  @HttpCode(HttpStatus.CREATED)
  async createProductTaskInBitrix(
    @Body() createBitrixTaskDto: CreateBitrixTaskDto,
  ): Promise<BitrixTaskResponseDto> {
    const product = await this.productsService.findOne(createBitrixTaskDto.productId);
    if (!product) { // Should be handled by productsService.findOne, but as a safeguard
        throw new NotFoundException(`Продукт с ID ${createBitrixTaskDto.productId} не найден.`);
    }
    
    const { taskId, updatedProduct } = await this.bitrix24Service.createTaskForProduct(
      product,
      createBitrixTaskDto.responsibleId,
      createBitrixTaskDto.projectId,
    );
    return {
        message: `Задача в Битрикс24 успешно создана с ID: ${taskId}`,
        bitrixTaskId: taskId,
        updatedProduct: updatedProduct // Return the updated product
    };
  }
}
