import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { StandardEnum } from '../../types/standard.enum';
import { DocumentEntity } from '../entities/document.entity';

export class DocumentQueryDto {
  @ApiPropertyOptional({ enum: StandardEnum, description: 'Filter by standard of the parent product' })
  @IsOptional()
  @IsEnum(StandardEnum)
  standard?: StandardEnum;

  @ApiPropertyOptional({ description: 'Filter by specific product ID (UUID format)' })
  @IsOptional()
  @IsUUID('4', {message: "productId должен быть валидным UUID"})
  productId?: string;

  @ApiPropertyOptional({ description: 'Search text for designation, product name snapshot, document type name, custom document name, comment' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Field to sort by (e.g., designation, productNameSnapshot, assignmentDate)', example: 'assignmentDate' })
  @IsOptional()
  @IsString()
  // Add specific allowed sort keys validation if needed, e.g. using @IsIn(['designation', 'productNameSnapshot', ...])
  sortBy?: keyof DocumentEntity | 'productName'; // Allow 'productName' for sorting by joined product's name

  @ApiPropertyOptional({ enum: ['asc', 'desc', 'ASC', 'DESC'], description: 'Sort order', example: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc', 'ASC', 'DESC'])
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
  @Max(100)
  limit?: number = 10;
}
