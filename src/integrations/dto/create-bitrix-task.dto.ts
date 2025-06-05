import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
// Чтобы избежать циклической зависимости при генерации Swagger, используем require для ProductEntity
// или просто указываем any / object для updatedProduct, если ProductEntity не нужен в явном виде в Swagger для этого DTO.
// const ProductEntitySchema = require('../../products/entities/product.entity').ProductEntity;


export class CreateBitrixTaskDto {
  @ApiProperty({ example: 'uuid-of-product', description: 'ID of the product for which to create a task' })
  @IsUUID('4', { message: 'productId must be a valid UUID' })
  productId: string;

  @ApiPropertyOptional({ example: 123, description: 'Optional ID of the responsible user in Bitrix24', type: Number })
  @IsOptional()
  @Type(() => Number) 
  @IsInt({ message: 'responsibleId must be an integer' })
  @Min(1, { message: 'responsibleId must be a positive integer' })
  responsibleId?: number;

  @ApiPropertyOptional({ example: 45, description: 'Optional ID of the project/group in Bitrix24', type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'projectId must be an integer' })
  @Min(1, { message: 'projectId must be a positive integer' })
  projectId?: number;
}

export class BitrixTaskResponseDto { 
    @ApiProperty({example: "Задача в Битрикс24 успешно создана с ID: 789"})
    message: string;

    @ApiProperty({example: "789"})
    bitrixTaskId: string;
    
    // Указываем тип как 'object' для Swagger, чтобы избежать проблем с импортом ProductEntity здесь.
    // Фактически будет возвращаться ProductEntity.
    @ApiPropertyOptional({ description: "Обновленный объект продукта с bitrixTaskId", type: 'object' }) 
    updatedProduct?: any; 
}
