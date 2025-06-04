import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { StandardEnum } from '../../types/standard.enum';

export class ProductQueryDto {
  @ApiPropertyOptional({ enum: StandardEnum, description: 'Filter by standard' })
  @IsOptional()
  @IsEnum(StandardEnum)
  standard?: StandardEnum;

  @ApiPropertyOptional({ description: 'Search text for product name, designation, comment' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Field to sort by (e.g., productName, registrationDate, standard)', example: 'productName' })
  @IsOptional()
  @IsString()
  sortBy?: keyof ProductEntity; // Use keyof for better type safety if possible, or define allowed string values

  @ApiPropertyOptional({ enum: ['asc', 'desc'], description: 'Sort order', example: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc', 'ASC', 'DESC']) // Allow both cases for flexibility
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC';

  @ApiPropertyOptional({ description: 'Page number for pagination', example: 1, type: Number, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', example: 10, type: Number, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // Set a reasonable max limit
  limit?: number = 10;
}
