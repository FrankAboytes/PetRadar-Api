import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LostPet, FoundPet } from '../pets/lost-found.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(LostPet) private lostRepo: Repository<LostPet>,
    @InjectRepository(FoundPet) private foundRepo: Repository<FoundPet>,
  ) {}

  /**
   * Búsqueda por radio simple: encuentra mascotas perdidas activas dentro de X metros
   * usando cálculo de distancia simple (sin PostGIS)
   * ~0.0045 grados ≈ 500 metros
   */
  async searchNearby(lat: number, lng: number, radiusMeters: number = 500) {
    const radiusInDegrees = radiusMeters / 111000; // Conversión aproximada

    const result = await this.lostRepo
      .createQueryBuilder('lp')
      .leftJoin('pets', 'p', 'p.id::text = lp."petId"')
      .select([
        'lp.id', 'lp.description', 'lp.lat', 'lp.lng', 'lp.createdAt',
        'lp.petId',
        'p.name as pet_name', 'p.species as pet_species', 'p."photoUrl" as pet_photo',
      ])
      .addSelect(
        `SQRT(POWER(lp.lat - :lat, 2) + POWER(lp.lng - :lng, 2)) * 111000`,
        'distance_meters',
      )
      .where('lp."isActive" = true')
      .andWhere('ABS(lp.lat - :lat) < :radius', { lat, radius: radiusInDegrees })
      .andWhere('ABS(lp.lng - :lng) < :radius', { lng, radius: radiusInDegrees })
      .setParameters({ lng, lat })
      .orderBy('distance_meters', 'ASC')
      .getRawMany();

    return {
      center: { lat, lng },
      radiusMeters,
      matches: result,
      total: result.length,
    };
  }

  async findAllLostLocations() {
    return this.lostRepo
      .createQueryBuilder('lp')
      .select(['lp.id', 'lp.description', 'lp.lat', 'lp.lng', 'lp.createdAt'])
      .where('lp."isActive" = true')
      .getMany();
  }
}

