import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  })
  email: string;

  // select: false — password is never returned in queries unless explicitly requested
  @Prop({ required: true, minlength: 8, select: false })
  password: string;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 50 })
  name: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
