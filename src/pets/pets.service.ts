import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './pet.entity';
import { LostPet, FoundPet } from './lost-found.entity';
import { CreatePetDto, CreateLostDto, CreateFoundDto } from './pets.dto';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet) private petRepo: Repository<Pet>,
    @InjectRepository(LostPet) private lostRepo: Repository<LostPet>,
    @InjectRepository(FoundPet) private foundRepo: Repository<FoundPet>,
  ) {}

  // ═══ CRUD Pets ═══
  async create(ownerId: string, dto: CreatePetDto) {
    return this.petRepo.save(this.petRepo.create({ ...dto, ownerId }));
  }

  async findAll(ownerId: string) {
    return this.petRepo.find({ where: { ownerId, isActive: true } });
  }

  async findOne(id: string) {
    const pet = await this.petRepo.findOne({ where: { id } });
    if (!pet) throw new NotFoundException('Mascota no encontrada');
    return pet;
  }

  async remove(id: string) {
    const pet = await this.findOne(id);
    pet.isActive = false;
    return this.petRepo.save(pet);
  }

  // ═══ Lost Pets ═══
  async reportLost(ownerId: string, dto: CreateLostDto) {
    const pet = await this.petRepo.findOne({ where: { id: dto.petId, ownerId } });
    if (!pet) throw new NotFoundException('Mascota no encontrada');

    const lost = this.lostRepo.create({
      petId: dto.petId,
      description: dto.description,
      lat: dto.lat,
      lng: dto.lng,
      isActive: true,
    });
    await this.lostRepo.save(lost);
    // Set geometry after save
    await this.lostRepo.query(
      'UPDATE lost_pets SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE id = $3',
      [dto.lng, dto.lat, lost.id]
    );
    return this.lostRepo.findOne({ where: { id: lost.id } });
  }

  async getLostPets(lat?: number, lng?: number) {
    return this.lostRepo
      .createQueryBuilder('lp')
      .leftJoin('pets', 'p', 'p.id::text = lp."petId"')
      .leftJoin('users', 'u', 'u.id::text = p."ownerId"')
      .select([
        'lp.id', 'lp.petId', 'lp.description', 'lp.lat', 'lp.lng', 'lp.isActive', 'lp.createdAt',
        'p.name as petName', 'p.species as petSpecies', 'p.breed as petBreed', 'p.color as petColor',
        'p."photoUrl" as petPhoto', 'p."ownerId" as ownerId',
        'u.name as ownerName', 'u.phone as ownerPhone',
      ])
      .where('lp.isActive = :active', { active: true })
      .addSelect(lat && lng ? `ST_Distance(lp.location::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography)` : 'NULL', 'distance')
      .orderBy('lp.createdAt', 'DESC')
      .getRawMany();
  }

  async markLostAsFound(id: string) {
    await this.lostRepo.update(id, { isActive: false });
    return { message: '✅ Mascota marcada como encontrada' };
  }

  // ═══ Found Pets ═══
  async reportFound(dto: CreateFoundDto) {
    const found = this.foundRepo.create({
      petId: dto.petId || undefined,
      description: dto.description,
      lat: dto.lat,
      lng: dto.lng,
    });
    await this.foundRepo.save(found);
    await this.foundRepo.query(
      'UPDATE found_pets SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE id = $3',
      [dto.lng, dto.lat, found.id]
    );

    // Búsqueda por radio con PostGIS ST_DWithin
    const nearby = await this.searchNearbyLostPets(dto.lat, dto.lng);

    return { found, nearbyLostPets: nearby };
  }

  async getFoundPets() {
    return this.foundRepo.find({ order: { createdAt: 'DESC' } });
  }

  async confirmFound(foundId: string) {
    const found = await this.foundRepo.findOne({ where: { id: foundId } });
    if (!found) throw new NotFoundException('Reporte no encontrado');
    // Marcar la mascota perdida vinculada como inactiva
    if (found.matchedLostPetId) {
      await this.lostRepo.update(found.matchedLostPetId, { isActive: false });
    }
    return { message: '✅ Mascota confirmada como encontrada', found };
  }

  // ═══ PostGIS: búsqueda por radio (500m) ═══
  async searchNearbyLostPets(lat: number, lng: number) {
    return this.lostRepo
      .createQueryBuilder('lp')
      .leftJoin('pets', 'p', 'p.id::text = lp."petId"')
      .where('lp.is_active = :active', { active: true })
      .andWhere(
        `ST_DWithin(lp.location::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, 500)`,
        { lng, lat },
      )
      .select([
        'lp.id', 'lp.description', 'lp.lat', 'lp.lng',
        'p.name as pet_name', 'p.species as pet_species', 'p."photoUrl" as pet_photo',
        `ST_Distance(lp.location::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) as distance`,
      ])
      .orderBy('distance', 'ASC')
      .getRawMany();
  }
}
