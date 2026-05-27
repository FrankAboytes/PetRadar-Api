import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('lost_pets')
export class LostPet {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  petId: string;

  @ApiProperty()
  @Column()
  description: string;

  @ApiProperty({ description: 'Latitud donde se perdió' })
  @Column({ type: 'double precision' })
  lat: number;

  @ApiProperty({ description: 'Longitud donde se perdió' })
  @Column({ type: 'double precision' })
  lng: number;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('found_pets')
export class FoundPet {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ nullable: true })
  petId: string;

  @ApiProperty()
  @Column()
  description: string;

  @ApiProperty({ description: 'Latitud donde se encontró' })
  @Column({ type: 'double precision' })
  lat: number;

  @ApiProperty({ description: 'Longitud donde se encontró' })
  @Column({ type: 'double precision' })
  lng: number;

  @ApiProperty()
  @Column({ nullable: true })
  matchedLostPetId: string;

  @ApiProperty()
  @Column({ type: 'double precision', nullable: true })
  matchDistance: number;

  @CreateDateColumn()
  createdAt: Date;
}

