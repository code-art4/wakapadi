import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Delete,
  HttpCode,
  Inject,
} from '@nestjs/common';
import { TourService } from '../services/tour.service';
import { Tour, TourDocument } from '../schemas/tour.schema';
import { CreateTourDto } from '../types/tour.dto';
import { QdrantService } from '../services/qdrant.service';
import { v4 as uuidv4 } from 'uuid';
import { EmbeddingService } from '../services/embedding.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Controller('tours')
export class TourController {
  constructor(
    @InjectModel(Tour.name) private tourModel: Model<TourDocument>,
    private readonly tourService: TourService,
    private readonly qdrantService: QdrantService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  @Get('manual-test')
  async manualTest() {
    const id = uuidv4(); // e.g., "f47ac10b-58cc-4372-a567-0e02b2c3d479"

    const fakeVector = Array(384).fill(0.01);
    await this.qdrantService.upsertTour(id, fakeVector, {
      title: 'Berlin Tour',
      location: 'Berlin',
    });

    const results = await this.qdrantService.searchSimilarTours(fakeVector);
    return results;
  }

  @Get()
  findAll(@Query('location') location?: string) {
    return this.tourService.findAll(location);
  }

  @Post()
  create(@Body() tour: CreateTourDto) {
    return this.tourService.create(tour);
  }

  @Post('seed')
  async seedTours(@Body() tours: CreateTourDto[]) {
    return Promise.all(
      tours.map(async (tour: { title: string }) => {
        const exists = await this.tourService.findByTitle(tour.title);
        if (!exists) {
          return this.tourService.create(tour);
        }
      }),
    );
  }

  @Delete()
  @HttpCode(204)
  async deleteAllTours(): Promise<void> {
    await this.tourService.deleteAll();
  }

  // @Get('search')
  // async searchTours(@Query('q') query: string) {
  //   return this.tourService.searchByVector(query);
  // }


  @Post('search')
  async searchTours(
    @Body('q') q: string,
    @Query('city') city?: string,
    @Query('limit') limit: number = 10,
    @Query('threshold') threshold: number = 0.7
  ) {
    if (!q) {
      return { message: 'Missing search query' };
    }

    const vector = await this.embeddingService.embed(q);
    const results = await this.qdrantService.searchSimilarTours(vector, limit, threshold, city);
    return results;
  }


  @Post('reindex')
  async reindexTours() {
    const tours = await this.tourModel.find(); // You must implement findAll()
    let indexed = 0;

    for (const tour of tours) {
      try {
        const embedding = await this.embeddingService.embed(
          tour.title + ' ' + tour.location,
        );
        const id = tour.id.toString();
        const payload = {
          title: tour.title,
          location: tour.location.toLowerCase(), // ✅ match Qdrant index
          externalPageUrl: tour.externalPageUrl,
          sourceUrl: tour.sourceUrl,
          image: tour.image,
          sourceType: tour.sourceType,
        };

        await this.qdrantService.upsertTour(id, embedding, payload);
        indexed++;
      } catch (err) {
        console.error(`❌ Failed to index tour ${tour.title}:`, err.message);
      }
    }

    return {
      message: `✅ Indexed ${indexed} out of ${tours.length} tours to Qdrant.`,
    };
  }

  // In your `app.controller.ts` or `qdrant.controller.ts`
}
