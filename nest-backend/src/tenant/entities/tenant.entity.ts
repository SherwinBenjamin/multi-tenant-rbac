import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true })
  name: string;
}

export type TenantDocument = Tenant & Document;
export const TenantSchema = SchemaFactory.createForClass(Tenant);
