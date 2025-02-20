import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Messages extends Document {
  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  receiverId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ default: false })
  seen: boolean;
}
export type MessagesDocument = Messages;
export const MessagesSchema = SchemaFactory.createForClass(Messages);
