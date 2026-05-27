import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('community_reports')
export class CommunityReport {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  reporterId: string; // userId del reportante

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column()
  description: string;

  @ApiProperty()
  @Column()
  category: string; // stray_animal, abuse, lost_pet_sighting, dangerous_area, other

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
  photoUrl: string;

  @ApiProperty()
  @Column({ default: 'pending' })
  status: string; // pending, verified, resolved, dismissed

  @ApiProperty()
  @Column({ default: 0 })
  upvotes: number;

  @CreateDateColumn()
  createdAt: Date;
}
