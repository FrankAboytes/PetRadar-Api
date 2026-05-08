import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PetsService } from './pets.service';
import { CreatePetDto, CreateLostDto, CreateFoundDto } from './pets.dto';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@ApiTags('🐾 Pets (SQL - PostgreSQL)')
@Controller()
export class PetsController {
  constructor(private petsService: PetsService) {}

  // ═══ CRUD ═══
  @Post('pets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar mascota (CREATE)' })
  create(@Req() req: any, @Body() dto: CreatePetDto) {
    return this.petsService.create(req.user.userId, dto);
  }

  @Get('pets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar mis mascotas (READ)' })
  findAll(@Req() req: any) {
    return this.petsService.findAll(req.user.userId);
  }

  @Get('pets/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ver mascota por ID (READ)' })
  findOne(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  @Delete('pets/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar mascota (DELETE)' })
  remove(@Param('id') id: string) {
    return this.petsService.remove(id);
  }

  // ═══ Lost & Found ═══
  @Post('lost-pets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reportar mascota perdida' })
  reportLost(@Req() req: any, @Body() dto: CreateLostDto) {
    return this.petsService.reportLost(req.user.userId, dto);
  }

  @Get('lost-pets')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Listar mascotas perdidas (🟢 Cache Redis)' })
  getLostPets() {
    return this.petsService.getLostPets();
  }

  @Post('found-pets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reportar mascota encontrada (🔍 búsqueda por radio 500m)' })
  reportFound(@Body() dto: CreateFoundDto) {
    return this.petsService.reportFound(dto);
  }

  @Get('found-pets')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Listar mascotas encontradas (🟢 Cache Redis)' })
  getFoundPets() {
    return this.petsService.getFoundPets();
  }
}
