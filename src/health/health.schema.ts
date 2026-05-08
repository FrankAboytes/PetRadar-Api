import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class HealthRecord extends Document {
  @ApiProperty()
  @Prop({ required: true })
  petId: string;

  @ApiProperty()
  @Prop({ required: true })
  type: string; // vaccine, checkup, medication, surgery

  @ApiProperty()
  @Prop({ required: true })
  description: string;

  @ApiProperty()
  @Prop()
  veterinarian: string;

  @ApiProperty()
  @Prop({ type: Object })
  vitals?: {
    weight?: number;
    temperature?: number;
    heartRate?: number;
  };

  @ApiProperty()
  @Prop()
  notes: string;

  @ApiProperty()
  @Prop({ default: Date.now })
  date: Date;
}

export const HealthRecordSchema = SchemaFactory.createForClass(HealthRecord);
