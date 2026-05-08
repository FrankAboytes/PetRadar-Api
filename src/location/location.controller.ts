import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LocationService } from './location.service';

@ApiTags('📍 Location (PostGIS Geo-Search)')
@Controller('location')
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Get('search')
  @ApiOperation({ summary: 'Buscar mascotas perdidas cerca de un punto (PostGIS ST_DWithin)' })
  @ApiQuery({ name: 'lat', type: Number, example: 19.4328 })
  @ApiQuery({ name: 'lng', type: Number, example: -99.1330 })
  @ApiQuery({ name: 'radius', type: Number, required: false, example: 500 })
  search(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number = 500,
  ) {
    return this.locationService.searchNearby(+lat, +lng, +radius);
  }

  @Get('lost-locations')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Obtener todas las ubicaciones de mascotas perdidas (🟢 Cache Redis)' })
  getAllLocations() {
    return this.locationService.findAllLostLocations();
  }
}
