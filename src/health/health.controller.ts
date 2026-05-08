import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('🏥 Health Records (NoSQL - MongoDB)')
@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Post()
  @ApiOperation({ summary: 'Crear registro de salud (NoSQL)' })
  create(@Body() data: any) {
    return this.healthService.create(data);
  }

  @Get('pet/:petId')
  @ApiOperation({ summary: 'Historial médico por mascota (NoSQL)' })
  findByPet(@Param('petId') petId: string) {
    return this.healthService.findByPet(petId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver registro de salud' })
  findOne(@Param('id') id: string) {
    return this.healthService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar registro de salud' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.healthService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar registro de salud' })
  remove(@Param('id') id: string) {
    return this.healthService.remove(id);
  }
}
