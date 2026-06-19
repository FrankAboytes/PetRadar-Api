import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class ChatMessage extends Document {
  @ApiProperty()
  @Prop({ required: true })
  petId: string; // pet relacionado

  @ApiProperty()
  @Prop({ required: true })
  senderId: string; // userId del remitente

  @ApiProperty()
  @Prop({ required: true })
  receiverId: string; // userId del destinatario

  @ApiProperty()
  @Prop({ required: true })
  message!: string;


  @ApiProperty()
  @Prop({ default: 'text' })
  type: string; // text, image, location

  @ApiProperty()
  @Prop({ default: false })
  isRead!: boolean;


  @ApiProperty()
  @Prop()
  readAt!: Date;

}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
ChatMessageSchema.index({ petId: 1, createdAt: -1 });
ChatMessageSchema.index({ senderId: 1, receiverId: 1 });
