import {
  Controller,
  Get,
  Inject,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

}
