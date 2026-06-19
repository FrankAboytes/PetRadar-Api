import { Controller, Post, Body, Get, Patch, UseGuards, Req, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@ApiTags('🔐 Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  async register(@Body() dto: RegisterDto) {
    this.logger.log(`📝 Registro: ${dto.email}`);
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  async login(@Body() dto: LoginDto) {
    this.logger.log(`🔑 Login intent: ${dto.email}`);
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  profile(@Req() req: any) {
    this.logger.debug(`👤 Profile fetch: user ${req.user.userId}`);
    return this.authService.getProfile(req.user.userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar perfil' })
  updateProfile(@Req() req: any, @Body() data: any) {
    this.logger.warn(`✏️ Profile update: user ${req.user.userId} — fields: ${Object.keys(data).join(', ')}`);
    return this.authService.updateProfile(req.user.userId, data);
  }
}
