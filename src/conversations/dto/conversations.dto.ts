import { IsString, IsNotEmpty } from 'class-validator';

export class ConversationsDto {
  @IsNotEmpty()
  @IsString()
  senderId: string;

  @IsNotEmpty()
  @IsString()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
