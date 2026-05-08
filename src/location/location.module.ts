import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { LostPet, FoundPet } from '../pets/lost-found.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LostPet, FoundPet])],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
