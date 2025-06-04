import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsBoolean, MaxLength, Matches, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { StandardEnum } from '../../types/standard.enum';

// ESPD Specific Details DTO (nested)
export class EspdDetailsDto {
  @ApiProperty({ example: 'ПО', description: 'ESPD Software Type (ПО or ПАК)'})
  @IsEnum(['ПО', 'ПАК'], {message: 'Тип ПО ЕСПД должен быть "ПО" или "ПАК"'})
  espdSoftwareType: string;

  @ApiProperty({ example: '01', description: 'ESPD Base Document Revision (01-99)'})
  @Matches(/^(0[1-9]|[1-9]\d)$/, { message: 'Номер редакции основного документа ЕСПД должен быть от 01 до 99' })
  espdBaseDocRevision: string;

  @ApiProperty({ example: '01', description: 'ESPD Document Number by Type (01-99)'})
  @Matches(/^(0[1-9]|[1-9]\d)$/, { message: 'Номер документа данного вида ЕСПД должен быть от 01 до 99' })
  espdDocNumberByType: string;

  @ApiPropertyOptional({ example: '1', description: 'ESPD Document Part Number (1-9, optional)'})
  @IsOptional()
  @Matches(/^[1-9]$/, { message: 'Номер части документа ЕСПД должен быть от 1 до 9' })
  @MaxLength(1)
  espdDocPartNumber?: string;
}

// ESKD Specific Details DTO (nested)
export class EskdDetailsDto {
  @ApiPropertyOptional({ example: '01', description: 'ESKD Document Revision (01-99, optional)'})
  @IsOptional()
  @Matches(/^(0[1-9]|[1-9]\d)?$/, { message: 'Номер редакции документа ЕСКД должен быть от 01 до 99 или пустым' }) // Allow empty
  @MaxLength(2)
  eskdDocRevision?: string;

  @ApiPropertyOptional({ example: 'Ч1', description: 'ESKD Document Part Number (optional)'})
  @IsOptional()
  @IsString()
  @MaxLength(10)
  eskdDocPartNum?: string;
}

// GOST 34 Specific Details DTO (nested)
export class Gost34DetailsDto {
  @ApiPropertyOptional({ example: '01', description: 'GOST 34 Document Sequence Number (XX, optional, backend generates if empty, 2 digits)'})
  @IsOptional()
  @ValidateIf(o => o.gost34DocSequenceNumUserInput !== undefined && o.gost34DocSequenceNumUserInput !== '')
  @Matches(/^\d{2}$/, { message: 'Порядковый номер документа ГОСТ 34 должен состоять из 2 цифр' })
  @MaxLength(2)
  gost34DocSequenceNumUserInput?: string;

  @ApiPropertyOptional({ example: '2', description: 'GOST 34 Revision Number (2-9, optional)'})
  @IsOptional()
  @Matches(/^[2-9]?$/, { message: 'Номер редакции документа ГОСТ 34 должен быть от 2 до 9 или пустым' }) // Allow empty
  @MaxLength(1)
  gost34RevisionNum?: string;

  @ApiPropertyOptional({ example: '1', description: 'GOST 34 Part Number (1-9, optional)'})
  @IsOptional()
  @Matches(/^[1-9]?$/, { message: 'Номер части документа ГОСТ 34 должен быть от 1 до 9 или пустым' }) // Allow empty
  @MaxLength(1)
  gost34PartNum?: string;

  @ApiProperty({ example: false, description: 'GOST 34 Is Machine Readable Document (.М)'})
  @IsBoolean({message: "Признак машиночитаемости ГОСТ 34 должен быть булевым значением"})
  gost34MachineReadable: boolean;
}


export class CreateDocumentDto {
  @ApiProperty({ example: 'uuid-of-registered-product', description: 'ID of the registered product' })
  @IsNotEmpty({ message: 'ID зарегистрированного продукта не должен быть пустым' })
  @IsUUID('4', { message: 'ID зарегистрированного продукта должен быть валидным UUID' })
  registeredProductId: string;

  @ApiProperty({ example: '00', description: 'Document Type Code (e.g., "00" for ESPD Spec, "ТЗ" for GOST34 TOR)' })
  @IsNotEmpty({ message: 'Код вида документа не должен быть пустым' })
  @IsString()
  @MaxLength(10) // Adjust as per max code length (e.g. GOST34 can have "ПЭ3")
  docTypeCode: string;

  @ApiPropertyOptional({ example: 'Спецификация оборудования АБВГ.ХХХХХХ.ХХХ', description: 'Custom name for the document, overrides standard type name display' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customDocName?: string;

  @ApiPropertyOptional({ example: 'Комментарий к документу', description: 'Optional comment for the document' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
  
  // This field is crucial for conditional validation of details objects
  @ApiProperty({ enum: StandardEnum, description: 'Standard of the product this document belongs to (derived from product on backend, but sent by frontend for validation convenience)'})
  @IsEnum(StandardEnum, {message: "Недопустимый стандарт"})
  selectedStandard: StandardEnum;

  // Optional, backend should rely on registeredProductId to get product context
  @ApiPropertyOptional({ description: 'Context: Product name from frontend selection'})
  @IsOptional()
  @IsString()
  productNameForContext?: string;


  // Standard-specific details - validate based on `selectedStandard`
  @ApiPropertyOptional({ type: EspdDetailsDto, description: 'ESPD specific details (provide if selectedStandard is ESPD)' })
  @ValidateIf(o => o.selectedStandard === StandardEnum.ESPD)
  @Type(() => EspdDetailsDto) // Important for nested validation
  @ValidateNested()
  espdDetails?: EspdDetailsDto;

  @ApiPropertyOptional({ type: EskdDetailsDto, description: 'ESKD specific details (provide if selectedStandard is ESKD)' })
  @ValidateIf(o => o.selectedStandard === StandardEnum.ESKD)
  @Type(() => EskdDetailsDto)
  @ValidateNested()
  eskdDetails?: EskdDetailsDto;

  @ApiPropertyOptional({ type: Gost34DetailsDto, description: 'GOST 34 specific details (provide if selectedStandard is GOST34)' })
  @ValidateIf(o => o.selectedStandard === StandardEnum.GOST34)
  @Type(() => Gost34DetailsDto)
  @ValidateNested()
  gost34Details?: Gost34DetailsDto;
}
