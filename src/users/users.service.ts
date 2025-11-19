import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from '../auth/dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }
  
  async create(data: CreateUserDto): Promise<User> {
    const newUser = this.usersRepository.create(data);
    return this.usersRepository.save(newUser);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['user_id','full_name', 'email', 'passwordHash', 'role', 'loginMethod'], 
    });
  }
  // await this.usersService.updatePassword(user.user_id, hashedPassword);

  async updatePassword(user_id: number, hashedPassword: string): Promise<void > {
    await this.usersRepository.update(user_id, { passwordHash: hashedPassword })
  }

  async findOneById(user_id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { user_id },
    });
  }

  async isEmailTaken(email: string): Promise<boolean> {
    const count = await this.usersRepository.count({ where: { email } });
    return count > 0;
  }

  async updateRefreshTokenHash(user_id: number, hash: string | null): Promise<void> {
    await this.usersRepository.update(user_id, { refreshTokenHash: hash });
  }

  async findOneBySocialId(provider: 'google', providerId: string): Promise<User | null> {
    if (provider !== 'google') {
        return null;
    }
    return this.usersRepository.findOne({ 
        where: { googleId: providerId }, 
        select: [
            'user_id', 
            'full_name', 
            'email', 
            'role', 
            'loginMethod', 
            'googleId'
        ], 
    });
  }

  async updateSocialId(user_id: number, provider: 'google', providerId: string): Promise<User> {
    let updateData: any = { loginMethod: provider };
    if (provider === 'google') {
        updateData.googleId = providerId;
    }
    await this.usersRepository.update(user_id, updateData);
    const updatedUser = await this.findOneById(user_id);
    if (!updatedUser) {
        throw new NotFoundException('User not found after update.');
    }
    return updatedUser;
  }

  async createUserWithProvider(fullName: string, email: string, providerId: string, provider: string):Promise<User> {
    const data = {
      full_name: fullName,
      email: email,
      loginMethod: 'google' as const, 
      role: 'customer' as const, 
      googleId: providerId, 
      passwordHash: null, 
    }
    const newUser = this.usersRepository.create(data);
    return this.usersRepository.save(newUser);
  }

}