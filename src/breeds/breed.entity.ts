import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('breeds')
export class Breed {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;


  @ApiProperty()
  @Column()
  name: string; // ej: Labrador, Siames, Persa

  @ApiProperty()
  @Column()
  species: string; // dog, cat, bird, etc.

  @ApiProperty()
  @Column({ nullable: true })
  description!: string;


  @ApiProperty()
  @Column({ default: true })
  isActive!: boolean;

}
