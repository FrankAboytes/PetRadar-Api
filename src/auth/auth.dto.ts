import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'darko@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securepass123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Darko' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+525512345678', required: false })
  phone?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'darko@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securepass123' })
  @IsString()
  password: string;
}
