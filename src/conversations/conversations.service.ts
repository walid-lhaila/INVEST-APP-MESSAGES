
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
    const username = decodedToken.preferred_username;
    if (!username) {
      throw new Error('Invalid token: Username not found.');
    }
    return username;
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

  async addMessage(senderUsername: string, receiverUsername: string, content: string) {
    const conversation = await this.getOrCreateConversation(senderUsername, receiverUsername);
    conversation.messages.push({ senderUsername, content, isRead: false, timestamp: new Date() });
    await conversation.save();
    return conversation;
  }


  async getConversationById(conversationId: string) {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new Error('Conversation Not Found');
    }
    return conversation;
  }

  async getAllConversation(username: string) {
    const allConversations = await this.conversationModel.find({
      $or: [{ user1: username }, { user2: username }],
    });
    if (!allConversations) {
      throw new Error('Conversations Not Found');
    }
    return allConversations;
  }
}
