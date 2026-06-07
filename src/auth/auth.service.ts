import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { RegisterDto, LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new UnauthorizedException('Email ya registrado');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({ ...dto, password: hash });
    await this.userRepo.save(user);

    return this.token(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'email', 'password', 'name'],
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.token(user);
  }

  async getProfile(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (user) {
      const { password, ...safe } = user as any;
      return safe;
    }
    return null;
  }

  async updateProfile(id: string, data: any) {
    // Filter out undefined/null values to avoid wiping existing data
    const clean: any = {};
    for (const key of ['name', 'phone', 'city']) {
      if (data[key] !== undefined && data[key] !== null) {
        clean[key] = data[key];
      }
    }
    if (Object.keys(clean).length > 0) {
      await this.userRepo.update(id, clean);
    }
    const user = await this.userRepo.findOne({ where: { id } });
    if (user) {
      // Don't return password
      const { password, ...safe } = user as any;
      return safe;
    }
    return null;
  }

  private token(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}
