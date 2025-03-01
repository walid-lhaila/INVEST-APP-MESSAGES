import { Logger, UnauthorizedException } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConversationsService } from './conversations.service';

@WebSocketGateway(4567)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);
  private users: { id: string; socketId: string }[] = [];
  @WebSocketServer() io: Server;

  constructor(private readonly conversationsService: ConversationsService) {}

  afterInit() {
    this.logger.log('Initialized');
  }

  async handleConnection(client: Socket) {
    try {
      let authHeader = client.handshake?.auth?.token;

      if (!authHeader) {
        throw new UnauthorizedException('Missing authorization token');
      }

      const userId = await this.conversationsService.verifyToken(authHeader);
      this.users.push({ id: userId, socketId: client.id });

      this.logger.log(`User connected: ID ${userId}`);
      this.logger.debug(`Connected clients: ${this.users.length}`);
    } catch (error) {
      this.logger.error('Unauthorized WebSocket connection:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.users = this.users.filter((user) => user.socketId !== client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: string): Promise<void> {
    try {
      const authHeader = client.handshake?.auth?.token;
      if (!authHeader) {
        throw new UnauthorizedException('Missing authorization token');
      }

      const senderId = await this.conversationsService.verifyToken(authHeader);
      const { receiverId, content } = JSON.parse(payload);

      const newMessage = await this.conversationsService.addMessage(
        senderId,
        receiverId,
        content,
      );

      const receiverSocket = this.users.find((u) => u.id === receiverId);
      if (receiverSocket) {
        this.io.to(receiverSocket.socketId).emit('receiveMessage', newMessage);
      }
    } catch (error) {
      this.logger.error('Error sending message:', error);
      client.emit('error', { message: 'Error sending message' });
    }
  }

}
