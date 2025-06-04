import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto { // Renamed from RegisterUserDto for consistency if used by UsersService directly
  @ApiProperty({ example: 'newuser', description: 'Username for registration' })
  @IsNotEmpty({ message: 'Username should not be empty' })
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(30, { message: 'Username must be at most 30 characters long' })
  username: string;

  @ApiProperty({ example: 'securePassword123', description: 'Password for registration' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(50, { message: 'Password must be at most 50 characters long' })
  // Add @Matches for password complexity if needed: @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'Password too weak' })
  password: string;
}
