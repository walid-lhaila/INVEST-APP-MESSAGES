import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Messages, MessagesSchema } from './entity/messages.entity';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Messages.name, schema: MessagesSchema },
    ]),
    AuthModule,
    ConfigModule,
  ],
  providers: [MessagesService, ChatGateway],
  controllers: [MessagesController],
})
export class MessagesModule {}
