import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tour, TourSchema } from '../schemas/tour.schema';
import { TourService } from '../services/tour.service';
import { TourController } from '../controllers/tour.controller';
import { EmbeddingService } from '../services/embedding.service';
import { QdrantService } from '../services/qdrant.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Tour.name, schema: TourSchema }])],
  controllers: [TourController],
  providers: [TourService, EmbeddingService, QdrantService],
  exports: [TourService, MongooseModule], // 👈 THIS is what was missing

})
export class TourModule {}
