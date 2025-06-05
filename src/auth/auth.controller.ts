import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserEntity } from '../users/entities/user.entity'; // For type hint
import { JwtAuthGuard } from './guards/jwt-auth.guard';


@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local')) // 'local' refers to LocalStrategy
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in a user' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 200, description: 'Login successful.', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(@Request() req): Promise<AuthResponseDto> {
    // req.user is populated by LocalStrategy's validate method, which returns UserEntity (without password)
    return this.authService.login(req.user as UserEntity);
  }

  @UseGuards(JwtAuthGuard) // Protect this route with JWT
  @ApiBearerAuth() // Indicate Swagger that this endpoint needs Bearer token
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Current user data.', type: UserEntity }) // Adjust to return Partial<UserEntity> if password excluded
  @ApiResponse({ status: 401, description: 'Unauthorized.'})
  async getProfile(@Request() req): Promise<Partial<UserEntity>> {
    // req.user is populated by JwtStrategy's validate method
    // It already excludes the password.
    return req.user; 
  }
}
