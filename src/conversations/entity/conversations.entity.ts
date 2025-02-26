import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Message {
  @Prop({ required: true })
  senderUsername: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ required: true })
  user1: string;

  @Prop({ required: true })
  user2: string;

  @Prop({ type: [MessageSchema], default: [] })
  messages: Message[];
}

export type ConversationDocument = Conversation;
export const ConversationSchema = SchemaFactory.createForClass(Conversation);
