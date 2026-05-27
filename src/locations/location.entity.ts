import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('location_history')
export class LocationHistory {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  petId: string;

  @ApiProperty()
  @Column({ type: 'double precision' })
  latitude: number;

  @ApiProperty()
  @Column({ type: 'double precision' })
  longitude: number;

  @ApiProperty()
  @Column({ nullable: true })
  address: string;

  @ApiProperty()
  @Column({ nullable: true })
  accuracy: number; // metros de precision GPS

  @ApiProperty()
  @Column({ nullable: true })
  batteryLevel: number; // % bateria del AirTag/GPS tracker

  @ApiProperty()
  @Column()
  source: string; // airtag, gps, manual, wifi_triangulation

  @CreateDateColumn()
  recordedAt: Date;
}
