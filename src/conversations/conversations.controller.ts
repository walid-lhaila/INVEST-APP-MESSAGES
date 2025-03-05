import { Controller } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @MessagePattern('send-message')
  async sendMessage(data: {
    senderUsername: string;
    receiverUsername: string;
    content: string;
  }) {
    return await this.conversationsService.addMessage(
      data.senderUsername,
      data.receiverUsername,
      data.content,
    );
  }

  @MessagePattern('create-conversation')
  async createConversation(data: { user1: string; user2: string }) {
    console.log('Received create-conversation event', data);
    return await this.conversationsService.getOrCreateConversation(
      data.user1,
      data.user2,
    );
  }

  @MessagePattern({ cmd: 'get-conversation-by-id' })
  async getConversationById(
    @Payload() data: { autHeader: string; conversationId: string },
  ) {
    const { autHeader, conversationId } = data;
    await this.conversationsService.verifyToken(autHeader);
    return this.conversationsService.getConversationById(conversationId);
  }

  @MessagePattern({ cmd: 'get-all-conversations' })
  async getAllConversation(@Payload() { autHeader }: any) {
    const username = await this.conversationsService.verifyToken(autHeader);
    return await this.conversationsService.getAllConversation(username);
  }
}
