import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../auth/dto/register-user.dto'; // Assuming DTO is in auth for registration

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async findOneByUsername(username: string): Promise<UserEntity | undefined> {
    const user = await this.usersRepository.findOne({ where: { username } });
    return user || undefined; // Ensure undefined is returned if not found
  }

  async findOneById(id: string): Promise<UserEntity | undefined> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return user || undefined; // Ensure undefined is returned if not found
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const { username, password } = createUserDto;

    const existingUser = await this.findOneByUsername(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  // Add other user management methods if needed (e.g., update, delete)
}
