import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreatePetDto {
  @ApiProperty({ example: 'Firulais' })
  @IsString()
  name!: string;


  @ApiProperty({ example: 'dog' })
  @IsString()
  species!: string;


  @ApiProperty({ example: 'Labrador' })
  @IsString()
  breed!: string;


  @ApiProperty({ example: 'Negro', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  age?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateLostDto {
  @ApiProperty()
  @IsString()
  petId!: string;


  @ApiProperty({ example: 'Se perdió cerca del parque central' })
  @IsString()
  description!: string;


  @ApiProperty({ example: 19.4326 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;


  @ApiProperty({ example: -99.1332 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

}

export class CreateFoundDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  petId?: string;

  @ApiProperty({ example: 'Encontrado en la esquina de Reforma e Insurgentes' })
  @IsString()
  description!: string;


  @ApiProperty({ example: 19.4328 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;


  @ApiProperty({ example: -99.1330 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

}
