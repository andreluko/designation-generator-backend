import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateDocumentCommentDto {
  @ApiPropertyOptional({ example: 'Обновленный комментарий к документу', description: 'Updated comment for the document. Send null or empty string to clear.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string | null; // Allow null to explicitly clear comment
}
