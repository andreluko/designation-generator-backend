import { Controller, Get, Param, UseGuards, Post, Body, HttpCode, HttpStatus, NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from '../auth/dto/register-user.dto'; // For admin user creation


@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // This endpoint might be for admin purposes or initial setup
  // Ensure it's properly secured if exposed.
  // For now, let's assume it requires JWT auth (e.g. an admin is logged in)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('register') // Or a more secure path like /admin/users
  @ApiOperation({ summary: 'Register a new user (admin/setup purposes)' })
  @ApiResponse({ status: 201, description: 'User created successfully.', type: UserEntity })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 409, description: 'Username already exists.' })
  @HttpCode(HttpStatus.CREATED)
  // @Roles(Role.Admin) // Example for role-based access, if you implement roles
  async register(@Body() createUserDto: CreateUserDto): Promise<Partial<UserEntity>> {
    const user = await this.usersService.createUser(createUserDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user; // Exclude password from response
    return result;
  }


  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found.', type: UserEntity })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Partial<UserEntity>> {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}
