import { Controller } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @MessagePattern('send-message')
  async sendMessage(data: {
    senderId: string;
    receiverId: string;
    content: string;
  }) {
    return await this.conversationsService.addMessage(
      data.senderId,
      data.receiverId,
      data.content,
    );
  }

  @MessagePattern({ cmd: 'get-conversation' })
  async getConversation(
    @Payload() data: { autHeader: string; receiverId: string },
  ) {
    console.log('test');
    const { autHeader, receiverId } = data;

    const senderId = await this.conversationsService.verifyToken(autHeader);
    return this.conversationsService.getConversation(senderId, receiverId);
  }

  @MessagePattern({ cmd: 'get-all-conversations' })
  async getAllConversation(@Payload() { autHeader }: any) {
    const userId = await this.conversationsService.verifyToken(autHeader);
    return await this.conversationsService.getAllConversation(userId);
  }
}
