// src/scripts/qdrant-indexer.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tour, TourDocument } from '../schemas/tour.schema';
import { QdrantService } from '../services/qdrant.service';
import { EmbeddingService } from '../services/embedding.service';

@Injectable()
export class QdrantIndexer implements OnModuleInit {
  private readonly logger = new Logger(QdrantIndexer.name);

  constructor(
    @InjectModel(Tour.name) private tourModel: Model<TourDocument>,
    private readonly qdrantService: QdrantService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async onModuleInit() {
    this.logger.log('🔄 Starting batch indexing of tours...');
    const tours = await this.tourModel.find({});

    for (const tour of tours) {
      try {
        const textToEmbed = `${tour.title} ${tour.location}`;
        const vector = await this.embeddingService.embed(textToEmbed);

        await this.qdrantService.upsertTour(tour.id.toString(), vector, {
          title: tour.title,
          location: tour.location,
          sourceUrl: tour.sourceUrl,
          image: tour.image,
          sourceType: tour.sourceType,
          externalPageUrl: tour.externalPageUrl,
        });
      } catch (error) {
        this.logger.error(`❌ Failed to index tour ID ${tour.id}:`, error);
      }
    }

    this.logger.log('✅ Finished indexing tours.');
  }
}
