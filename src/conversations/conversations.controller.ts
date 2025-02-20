import {
  Body,
  Controller,
  Headers,
  Post, UnauthorizedException,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('send')
  async sendMessage(
    @Headers('authorization') authHeader: string,
    @Body('receiverId') receiverId: string,
    @Body('content') content: string,
  ) {
    if(!authHeader) {
      throw new UnauthorizedException('Missing Authorization Token');
    }
    const senderId = await this.conversationsService.verifyToken(authHeader);
    const conversation = await this.conversationsService.addMessage(senderId, receiverId, content);
    return { message: 'Message sent successfully', conversation };
  }
}
