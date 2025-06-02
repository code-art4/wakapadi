// src/training/dto/train-bot.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TrainBotDto {
  @ApiProperty({
    description: 'Custom training phrases',
    example: [{ text: 'Find historical tours in Rome', city: 'Rome' }],
    required: false
  })
  phrases?: Array<{text: string, city: string}>;
}

export class TrainingStatusDto {
  @ApiProperty()
  status: string;
  
  @ApiProperty({ nullable: true })
  lastTrainingDate: Date | null;
  
  @ApiProperty({ required: false })
  phraseCount?: number;
}