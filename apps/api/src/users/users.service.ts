import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import * as bcrypt from "bcrypt";
import { NotFoundError } from 'rxjs';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) { }

  async create(dto: CreateUserDTO): Promise<User> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const userExists = await this.findByEmail(normalizedEmail);

    if (userExists) {
      throw new ConflictException("Usuário já existe!");
    }

    const hash = await this.hashPassword(dto.password)

    const user = this.userRepository.create({
      email: normalizedEmail,
      name: dto.name,
      passwordHash: hash
    });

    const savedUser = await this.userRepository.save(user);

    return savedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();

    const user = this.userRepository.findOne({ where: { email: normalizedEmail } });
  
    if (!user) throw new NotFoundException('Usuário não encontrado!');

    return user;
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();

    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: normalizedEmail })
      .getOne();
  }

  comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash)
  }

  private async hashPassword(plain: string): Promise<string> {
    const hash = await bcrypt.hash(plain, SALT_ROUNDS);

    return hash;
  }
}
