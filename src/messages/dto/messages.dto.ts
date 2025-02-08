import {
  IsMongoId,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MessagesDto {
  @IsMongoId()
  senderId: string;

  @IsMongoId()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @Type(() => Date)
  timestamp?: Date;

  @IsOptional()
  @IsBoolean()
  seen?: boolean;
}
