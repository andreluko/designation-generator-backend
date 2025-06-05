import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength, Matches, ValidateIf } from 'class-validator';
import { StandardEnum } from '../../types/standard.enum';

export class CreateProductDto {
  @ApiProperty({ example: 'Система управления базой данных "Квант"', description: 'Product name' })
  @IsNotEmpty({ message: 'Наименование продукта не должно быть пустым' })
  @IsString()
  @MaxLength(255)
  productName: string;

  @ApiProperty({ enum: StandardEnum, example: StandardEnum.ESPD, description: 'Standard type' })
  @IsNotEmpty({ message: 'Стандарт не должен быть пустым' })
  @IsEnum(StandardEnum, { message: 'Недопустимый тип стандарта' })
  standard: StandardEnum;

  @ApiPropertyOptional({ example: 'Комментарий к продукту', description: 'Optional comment' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

  // ESPD Specific Fields
  @ApiPropertyOptional({ example: '01', description: 'ESPD Classifier (e.g., "01" for Системы обработки данных)' })
  @ValidateIf(o => o.standard === StandardEnum.ESPD)
  @IsNotEmpty({ message: 'Классификатор ЕСПД обязателен для стандарта ЕСПД' })
  @IsString()
  @MaxLength(2) // Assuming classifier code is 2 chars, e.g., "01", "02"
  espdClassifier?: string;

  @ApiPropertyOptional({ example: '001', description: 'ESPD Product Sequential Part (user input, XXX, optional, 3 digits)' })
  @IsOptional() // Backend will generate if not provided
  @ValidateIf(o => o.espdProductSequentialPartUserInput !== undefined && o.espdProductSequentialPartUserInput !== '')
  @IsString()
  @Matches(/^\d{3}$/, { message: 'Порядковая часть продукта ЕСПД должна состоять из 3 цифр' })
  @MaxLength(3)
  espdProductSequentialPartUserInput?: string;

  // ESKD Specific Fields
  @ApiPropertyOptional({ example: 'АБВГ', description: 'ESKD Organization Code' })
  @ValidateIf(o => o.standard === StandardEnum.ESKD)
  @IsNotEmpty({ message: 'Код организации ЕСКД обязателен для стандарта ЕСКД' })
  @IsString()
  @MaxLength(4) // Example length
  eskdOrgCode?: string;

  @ApiPropertyOptional({ example: '123456', description: 'ESKD Classification Characteristic' })
  @ValidateIf(o => o.standard === StandardEnum.ESKD)
  @IsNotEmpty({ message: 'Классификационная характеристика ЕСКД обязательна для стандарта ЕСКД' })
  @IsString()
  @MaxLength(6) // Example length
  eskdClassChar?: string;

  @ApiPropertyOptional({ example: '000001', description: 'ESKD Base Serial Number (user input, XXXXXX, optional, 6 digits)' })
  @IsOptional() // Backend will generate if not provided
  @ValidateIf(o => o.eskdBaseSerialNumUserInput !== undefined && o.eskdBaseSerialNumUserInput !== '')
  @IsString()
  @Matches(/^\d{6}$/, { message: 'Порядковый регистрационный номер ЕСКД должен состоять из 6 цифр' })
  @MaxLength(6)
  eskdBaseSerialNumUserInput?: string;

  // GOST 34 Specific Fields
  @ApiPropertyOptional({ example: '1234567890123', description: 'GOST 34 Organization Code (e.g., OGRN)' })
  @ValidateIf(o => o.standard === StandardEnum.GOST34)
  @IsNotEmpty({ message: 'Код организации ГОСТ 34 обязателен для стандарта ГОСТ 34' })
  @IsString()
  @MaxLength(13) // Example OGRN length
  gost34OrgCode?: string;

  @ApiPropertyOptional({ example: 'АС', description: 'GOST 34 Classification Code' })
  @ValidateIf(o => o.standard === StandardEnum.GOST34)
  @IsNotEmpty({ message: 'Код классификационной характеристики ГОСТ 34 обязателен для стандарта ГОСТ 34' })
  @IsString()
  @MaxLength(10) // Example length
  gost34ClassCode?: string;

  @ApiPropertyOptional({ example: '001', description: 'GOST 34 System Registration Number (user input, XXX, optional, 3 digits)' })
  @IsOptional() // Backend will generate if not provided
  @ValidateIf(o => o.gost34SystemRegNumUserInput !== undefined && o.gost34SystemRegNumUserInput !== '')
  @IsString()
  @Matches(/^\d{3}$/, { message: 'Регистрационный номер системы ГОСТ 34 должен состоять из 3 цифр' })
  @MaxLength(3)
  gost34SystemRegNumUserInput?: string;
}
