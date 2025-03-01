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
  private users: { username: string; socketId: string }[] = [];
  @WebSocketServer() io: Server;

  constructor(private readonly conversationsService: ConversationsService) {}

  afterInit() {
    this.logger.log('Initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake?.auth?.token;

      if (!authHeader) {
        throw new UnauthorizedException('Missing authorization token');
      }

      const username = await this.conversationsService.verifyToken(authHeader);
      this.users.push({ username, socketId: client.id });

      this.logger.log(`User connected: ${username}`);
      this.logger.debug(`Connected clients: ${this.users.length}`);
      this.logger.debug(`Current users: ${JSON.stringify(this.users)}`);
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

      const senderUsername = await this.conversationsService.verifyToken(authHeader);
      const { receiverUsername, content } = JSON.parse(payload);

      const newMessage = await this.conversationsService.addMessage(
          senderUsername,
          receiverUsername,
          content
      );

      const receiverSocket = this.users.find(
        (u) => u.username === receiverUsername,
      );

      if (receiverSocket) {
        this.io.to(receiverSocket.socketId).emit('receiveMessage', {
          senderUsername,
          receiverUsername,
          content,
          timestamp: new Date().toISOString(),
          isRead: false,
        });
      }

    } catch (error) {
      this.logger.error('Error sending message:', error);
      client.emit('error', { message: 'Error sending message' });
    }
  }
}
