import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { UserEntity } from '../../users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'username' }); // Assumes 'username' and 'password' fields in login DTO
  }

  async validate(username: string, pass: string): Promise<Partial<UserEntity>> {
    const user = await this.authService.validateUser(username, pass);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
     // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user; // Exclude password from user object
    return result; // This will be attached to req.user by Passport if login is successful
  }
}
