import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../users/entities/user.entity';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT Access Token',
  })
  accessToken: string;

  @ApiProperty({ type: () => UserEntity, required: false, description: 'Authenticated user details (excluding password)'})
  user?: Partial<UserEntity>; // Partial to exclude password explicitly later
}
