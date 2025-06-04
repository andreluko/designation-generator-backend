import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Length } from 'class-validator';

export class UpdateCustomGost34TypeDto {
  // Code is usually not updatable due to its identifying nature, but name can be.
  @ApiPropertyOptional({ example: 'Обновленное наименование типа', description: 'Updated name for the custom GOST 34 type' })
  @IsOptional()
  @IsString()
  @Length(3, 255, { message: 'Наименование должно содержать от 3 до 255 символов' })
  name?: string;
}
