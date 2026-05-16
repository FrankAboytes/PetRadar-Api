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
   * Búsqueda por radio: encuentra mascotas perdidas activas dentro de X metros
   * usando ST_DWithin de PostGIS con cast a ::geography
   */
  async searchNearby(lat: number, lng: number, radiusMeters: number = 500) {
    const result = await this.lostRepo
      .createQueryBuilder('lp')
      .leftJoin('pets', 'p', 'p.id::text = lp."petId"')
      .select([
        'lp.id', 'lp.description', 'lp.lat', 'lp.lng', 'lp.createdAt',
        'lp.petId',
        'p.name as pet_name', 'p.species as pet_species', 'p."photoUrl" as pet_photo',
      ])
      .addSelect(
        `ST_Distance(lp.location::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography)`,
        'distance_meters',
      )
      .where('lp."isActive" = true')
      .andWhere(
        `ST_DWithin(lp.location::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radius)`,
      )
      .setParameters({ lng, lat, radius: radiusMeters })
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
