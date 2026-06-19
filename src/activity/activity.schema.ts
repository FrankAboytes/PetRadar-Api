import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class ActivityLog extends Document {
  @ApiProperty()
  @Prop({ required: true })
  userId!: string;


  @ApiProperty()
  @Prop({ required: true })
  action: string; // register_pet, report_lost, report_found, mark_found, scan_qr, update_profile, send_message, view_pet

  @ApiProperty()
  @Prop()
  targetId: string; // petId, lostId, foundId

  @ApiProperty()
  @Prop()
  targetType: string; // pet, lost_pet, found_pet, user, message

  @ApiProperty()
  @Prop({ type: Object })
  metadata: Record<string, any>; // datos extra (ej: { lat: 20.5, lng: -101.2 })

  @ApiProperty()
  @Prop()
  ipAddress!: string;


  @ApiProperty()
  @Prop()
  userAgent!: string;

}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });
ActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // TTL 90 dias
