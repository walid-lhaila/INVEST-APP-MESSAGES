import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Messages, MessagesDocument } from './entity/messages.entity';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { MessagesDto } from './dto/messages.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Messages.name) private messageModel: Model<MessagesDocument>,
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

  async createMessage(messageDto: MessagesDto): Promise<Messages> {
    if (typeof messageDto !== 'object' || Array.isArray(messageDto)) {
      throw new Error('Invalid message data: expected an object');
    }
    const createdMessage = new this.messageModel(messageDto);
    return createdMessage.save();
  }
}
