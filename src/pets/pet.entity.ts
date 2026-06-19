import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('pets')
export class Pet {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;


  @ApiProperty()
  @Column()
  name!: string;


  @ApiProperty()
  @Column()
  species: string; // dog, cat, etc.

  @ApiProperty()
  @Column()
  breed!: string;


  @ApiProperty()
  @Column({ nullable: true })
  color!: string;


  @ApiProperty()
  @Column({ type: 'int', nullable: true })
  age!: number;


  @ApiProperty()
  @Column({ nullable: true })
  photoUrl!: string;


  @ApiProperty()
  @Column({ nullable: true })
  description!: string;


  @ApiProperty()
  @Column()
  ownerId!: string;


  @ApiProperty()
  @Column({ default: true })
  isActive!: boolean;


  @CreateDateColumn()
  createdAt!: Date;

}
