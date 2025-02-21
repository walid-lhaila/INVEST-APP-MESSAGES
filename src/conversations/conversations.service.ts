import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Conversation } from './entity/conversations.entity';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
  ) {}

  async verifyToken(token: string): Promise<string> {
    const jwtToken = token.split(' ')[1];
    const decodedToken = jwt.decode(jwtToken) as jwt.JwtPayload;
    const id = decodedToken?.sub;
    if (!id) {
      throw new Error('Invalid token: ID not found.');
    }
    return id;
  }

  async getOrCreateConversation(user1: string, user2: string) {
    let conversation = await this.conversationModel.findOne({
      $or: [
        { user1, user2 },
        { user1: user2, user2: user1 },
      ],
    });
    if (!conversation) {
      conversation = new this.conversationModel({ user1, user2, messages: [] });
      await conversation.save();
    }
    return conversation;
  }

  async addMessage(senderId: string, receiverId: string, content: string) {
    const conversation = await this.getOrCreateConversation(
      senderId,
      receiverId,
    );
    conversation.messages.push({
      senderId,
      content,
      isRead: false,
      timestamp: new Date(),
    });
    await conversation.save();
    return conversation;
  }

  async getConversation(user1: string, user2: string) {
    const conversation = await this.conversationModel.findOne({
      $or: [
        { user1, user2 },
        { user1: user2, user2: user1 },
      ],
    });
    if (!conversation) {
      throw new Error('Conversation Not Found');
    }
    return conversation;
  }

  async getAllConversation(userId: string) {
    const allConversations = await this.conversationModel.find({
      $or: [{ user1: userId }, { user2: userId }],
    });
    if(!allConversations) {
      throw new Error('Conversations Not Found');
    }
    return allConversations;
  }

}
