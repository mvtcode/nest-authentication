import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Transform } from 'class-transformer';
import { UserTypes } from '../constant/userType.constant';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class User {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    index: true,
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
  })
  password: string;

  @Prop({
    type: String,
    required: true,
    enum: UserTypes,
    default: UserTypes.USER,
  })
  roles: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
