import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(username: string, pass: string): Promise<UserEntity | null> {
    const user = await this.usersService.findOneByUsername(username);
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: UserEntity): Promise<{ accessToken: string; user: Partial<UserEntity> }> {
    // Ensure password is not included in the payload or returned user object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userPayloadForResponse } = user;
    
    // Payload for JWT should contain identifying information but not sensitive data like full user object
    const jwtPayload = { username: user.username, sub: user.id };
    
    return {
      accessToken: this.jwtService.sign(jwtPayload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn'),
      }),
      user: userPayloadForResponse, // Return user details (without password) along with token
    };
  }
}
