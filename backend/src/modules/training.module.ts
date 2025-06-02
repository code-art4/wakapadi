// src/training/training.module.ts
import { Module } from '@nestjs/common';
import { TrainingController } from '../controllers/training.controller';
import { TrainingService } from '../services/training.service';
import { QdrantService } from '../services/qdrant.service';
import { TourService } from '../services/tour.service';
import { TourModule } from './tour.module';
import { EmbeddingService } from '../services/embedding.service';

@Module({
  controllers: [TrainingController],
  imports: [TourModule], // 👈 this is crucial
  providers: [TrainingService, QdrantService, TourService, EmbeddingService],
})
export class TrainingModule {}