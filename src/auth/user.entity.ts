import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;


  @ApiProperty()
  @Column({ unique: true })
  email!: string;


  @Column({ select: false })
  password!: string;


  @ApiProperty()
  @Column()
  name!: string;


  @ApiProperty()
  @Column({ nullable: true })
  phone!: string;


  @ApiProperty()
  @Column({ nullable: true })
  city!: string;


  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

}
