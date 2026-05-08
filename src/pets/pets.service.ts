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

    return this.lostRepo.save(this.lostRepo.create({
      ...dto,
      location: () => `SRID=4326;POINT(${dto.lng} ${dto.lat})`,
    }));
  }

  async getLostPets() {
    return this.lostRepo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  // ═══ Found Pets ═══
  async reportFound(dto: CreateFoundDto) {
    const found = await this.foundRepo.save(this.foundRepo.create({
      ...dto,
      location: () => `SRID=4326;POINT(${dto.lng} ${dto.lat})`,
    }));

    // Búsqueda por radio con PostGIS ST_DWithin
    const nearby = await this.searchNearbyLostPets(dto.lat, dto.lng);

    return { found, nearbyLostPets: nearby };
  }

  async getFoundPets() {
    return this.foundRepo.find({ order: { createdAt: 'DESC' } });
  }

  // ═══ PostGIS: búsqueda por radio (500m) ═══
  async searchNearbyLostPets(lat: number, lng: number) {
    return this.lostRepo
      .createQueryBuilder('lp')
      .leftJoin('pets', 'p', 'p.id = lp.petId')
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
