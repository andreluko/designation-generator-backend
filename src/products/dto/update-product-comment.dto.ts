import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateProductCommentDto {
  @ApiPropertyOptional({ example: 'Новый комментарий к продукту', description: 'Updated comment for the product. Send null or empty string to clear comment.' })
  @IsOptional() // Allows sending null or omitting the field
  @IsString({ message: 'Комментарий должен быть строкой' })
  @MaxLength(1000, { message: 'Комментарий не должен превышать 1000 символов' })
  comment?: string | null; // Allow null to explicitly clear comment
}
