import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('veterinaries')
export class Veterinary {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;


  @ApiProperty()
  @Column()
  name!: string;


  @ApiProperty()
  @Column()
  address!: string;


  @ApiProperty()
  @Column({ type: 'double precision' })
  latitude!: number;


  @ApiProperty()
  @Column({ type: 'double precision' })
  longitude!: number;


  @ApiProperty()
  @Column({ nullable: true })
  phone!: string;


  @ApiProperty()
  @Column({ nullable: true })
  email!: string;


  @ApiProperty()
  @Column({ nullable: true })
  website!: string;


  @ApiProperty()
  @Column({ default: 'general' })
  specialty: string; // general, emergency, surgery, dental, exotic

  @ApiProperty()
  @Column({ nullable: true })
  schedule: string; // "Lun-Vie 9:00-18:00, Sab 9:00-14:00"

  @ApiProperty()
  @Column({ default: true })
  isActive!: boolean;


  @ApiProperty()
  @Column({ default: 0 })
  rating!: number;


  @CreateDateColumn()
  createdAt!: Date;

}
