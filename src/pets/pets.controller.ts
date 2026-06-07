import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, Query } from '@nestjs/common';

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
  @ApiOperation({ summary: 'Listar mascotas perdidas con distancias (sin cache — tiempo real)' })
  getLostPets(@Query('lat') lat?: number, @Query('lng') lng?: number) {
    return this.petsService.getLostPets(lat, lng);
  }

  @Patch('lost-pets/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar mascota como encontrada (dueño confirma)' })
  markFound(@Param('id') id: string) {
    return this.petsService.markLostAsFound(id);
  }

  @Post('found-pets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reportar mascota encontrada (🔍 búsqueda por radio 500m)' })
  reportFound(@Body() dto: CreateFoundDto) {
    return this.petsService.reportFound(dto);
  }

  @Get('found-pets')
  @ApiOperation({ summary: 'Listar mascotas encontradas (🟢 Cache Redis)' })
  getFoundPets() {
    return this.petsService.getFoundPets();
  }

  @Post('found-pets/:id/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirmar que la mascota fue encontrada (SOLO el dueño)' })
  confirmFound(@Req() req: any, @Param('id') id: string) {
    return this.petsService.confirmFound(id, req.user.userId);
  }
}
