import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { GOST34_TABLE1_BASE_LETTERS_BACKEND, GOST34_CUSTOM_CODE_SECOND_CHARS_ALLOWED_BACKEND } from '../../constants';

const firstCharPattern = `^[${GOST34_TABLE1_BASE_LETTERS_BACKEND.map(l => l.letter).join('')}]$`;
const secondCharPattern = `^[${GOST34_CUSTOM_CODE_SECOND_CHARS_ALLOWED_BACKEND.split('').join('')}]$`; // Ensure each char is allowed


export class CreateCustomGost34TypeDto {
  @ApiProperty({ example: 'И1', description: 'Custom GOST 34 Document Type Code (2 chars, uppercase)' })
  @IsNotEmpty({ message: 'Код не должен быть пустым' })
  @IsString()
  @Length(2, 2, { message: 'Код должен состоять ровно из 2 символов' })
  @Matches(new RegExp(firstCharPattern), {message: `Первый символ кода должен быть одним из разрешенных: ${GOST34_TABLE1_BASE_LETTERS_BACKEND.map(l=>l.letter).join(', ')}`})
  @Matches(new RegExp(`.${secondCharPattern}`), {message: `Второй символ кода должен быть цифрой или одной из разрешенных русских букв: ${GOST34_CUSTOM_CODE_SECOND_CHARS_ALLOWED_BACKEND}`})
  code: string; // Will be uppercased in service

  @ApiProperty({ example: 'Инструкция по установке модуля', description: 'Custom GOST 34 Document Type Name' })
  @IsNotEmpty({ message: 'Наименование не должно быть пустым' })
  @IsString()
  @Length(3, 255, { message: 'Наименование должно содержать от 3 до 255 символов' })
  name: string;
}
