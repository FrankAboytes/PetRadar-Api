import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { Pet } from './pet.entity';
import { LostPet, FoundPet } from './lost-found.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pet, LostPet, FoundPet])],
  controllers: [PetsController],
  providers: [PetsService],
  exports: [PetsService],
})
export class PetsModule {}
