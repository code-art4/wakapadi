// src/training/training.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { TrainingService } from '../services/training.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Training')
@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post()
  @ApiOperation({ summary: 'Train the bot with sample data' })
  @ApiResponse({ status: 200, description: 'Training completed successfully' })
  @ApiResponse({ status: 500, description: 'Training failed' })
  async trainBot(@Body() body: { phrases?: Array<{text: string, city: string}> }) {
    return this.trainingService.trainBotWithVariations(body.phrases);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get training status' })
  async getTrainingStatus() {
    return this.trainingService.getTrainingStatus();
  }
}