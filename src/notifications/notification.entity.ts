import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('notifications')
export class Notification {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  userId: string; // destinatario

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column()
  message: string;

  @ApiProperty()
  @Column()
  type: string; // lost_pet_nearby, found_match, status_update, reminder

  @ApiProperty()
  @Column({ nullable: true })
  referenceId: string; // petId, lostId, foundId

  @ApiProperty()
  @Column({ nullable: true })
  referenceType: string; // pet, lost_pet, found_pet

  @ApiProperty()
  @Column({ default: false })
  isRead: boolean;

  @ApiProperty()
  @Column({ default: false })
  isArchived: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
