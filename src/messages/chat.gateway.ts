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
import { MessagesService } from './messages.service';

@WebSocketGateway(4567)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);
  private users: any[];
  @WebSocketServer() io: Server;

  constructor(private readonly messagesService: MessagesService) {
    this.users = [];
  }

  afterInit() {
    this.logger.log('Initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake?.headers?.authorization;
      if (!authHeader) {
        throw new UnauthorizedException('Missing authorization token');
      }

      const userId = await this.messagesService.verifyToken(authHeader);

      const user = {
        id: userId,
        socketId: client.id,
      };

      this.users.push(user);
      this.logger.log(`User connected: ID ${user.id}`);
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
      const messageData =
        typeof payload === 'string' ? JSON.parse(payload) : payload;
      if (typeof messageData !== 'object' || Array.isArray(messageData)) {
        this.logger.error('Invalid message format');
        return;
      }

      const receiverClient = this.users.find(
        (c) => messageData.receiverId === c.id,
      );
      if (receiverClient) {
        this.io
          .to(receiverClient.socketId)
          .emit('receiveMessage', messageData.content);
      }
    } catch (error) {
      this.logger.error('Error processing message:', error);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string): void {
    client.join(room);
    this.logger.log(`Client id: ${client.id} joined room: ${room}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room: string): void {
    client.leave(room);
    this.logger.log(`Client id: ${client.id} left room: ${room}`);
  }
}
