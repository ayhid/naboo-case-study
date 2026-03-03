import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Activity } from 'src/activity/activity.schema';
import { User } from 'src/user/user.schema';

@ObjectType()
@Schema({ timestamps: true })
export class Favorite extends Document {
  @Field(() => ID)
  id!: string;

  @Field(() => User)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId!: mongoose.Types.ObjectId;

  @Field(() => Activity)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Activity.name,
    required: true,
  })
  activityId!: mongoose.Types.ObjectId;

  @Field(() => Int)
  @Prop({ required: true, min: 1 })
  position!: number;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);

FavoriteSchema.index({ userId: 1, activityId: 1 }, { unique: true });
FavoriteSchema.index({ userId: 1, position: 1 }, { unique: true });

