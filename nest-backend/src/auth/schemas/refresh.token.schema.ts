import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RefreshToken {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  role: string;
}

export type RefreshTokenDocument = RefreshToken & Document;
export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
