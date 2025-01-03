import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  tenant_id: string;

  @Prop({ required: true, enum: ['superadmin', 'admin', 'user'] })
  role: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
