// src/services/training.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QdrantService } from './qdrant.service';
import { TourService } from './tour.service';

// @Injectable()
// export class TrainingService {
//   private readonly logger = new Logger(TrainingService.name);

//   private trainingPhrases = [
//     { phrase: "What tours are available in Paris?", city: "Paris" },
//     { phrase: "Looking for adventure activities in Tokyo", city: "Tokyo" },
//     { phrase: "Find me cultural tours in Rome", city: "Rome" },
//     { phrase: "Recommend some food tours in Bangkok", city: "Bangkok" },
//     { phrase: "What can I do in New York?", city: "New York" },
//     { phrase: "Show me walking tours in London", city: "London" },
//     { phrase: "I want to see historical sites in Berlin", city: "Berlin" },
//     { phrase: "Find me the best tours in Dubai", city: "Dubai" },
//     // Add many more variations...
//   ];

//   constructor(
//     private readonly qdrantService: QdrantService,
//     private readonly tourService: TourService,
//   ) {}

//   async trainBotWithVariations() {
//     for (const { phrase, city } of this.trainingPhrases) {
//       try {
//         const embedding = await this.tourService.embedText(phrase);
//         await this.qdrantService.upsertTrainingPhrase(phrase, embedding, city);
//         this.logger.log(`Trained phrase: ${phrase}`);
//       } catch (error) {
//         this.logger.error(`Failed to train phrase: ${phrase}`, error);
//       }
//     }
//   }
// }


// src/training/training.service.ts
// import { Injectable, Logger } from '@nestjs/common';
// import { QdrantService } from '../qdrant/qdrant.service';
// import { TourService } from '../tour/tour.service';

@Injectable()
export class TrainingService {
  private readonly logger = new Logger(TrainingService.name);
  private status = 'idle';
  private lastTrainingDate: Date | null = null;

  constructor(
    private readonly qdrantService: QdrantService,
    private readonly tourService: TourService,
  ) {}
  // @Cron(CronExpression.EVERY_DAY_AT_3AM)
  // async scheduledTraining() {
  //   if (process.env.NODE_ENV === 'production') {
  //     await this.trainBotWithVariations();
  //   }
  // }
  async trainBotWithVariations(customPhrases?: Array<{ city: string, text:string}>) {
    try {
      this.status = 'training';
      this.logger.log('Starting bot training...');

      const defaultPhrases = [
        { phrase: "What tours are available in Paris?", city: "Paris" },
        { phrase: "Looking for adventure activities in Tokyo", city: "Tokyo" },
        { phrase: "What tours are available in Paris?", city: "Paris" },
        { phrase: "Looking for adventure activities in Tokyo", city: "Tokyo" },
        { phrase: "Find me cultural tours in Rome", city: "Rome" },
        { phrase: "Recommend some food tours in Bangkok", city: "Bangkok" },
        { phrase: "What can I do in New York?", city: "New York" },
        { phrase: "Show me walking tours in London", city: "London" },
        { phrase: "I want to see historical sites in Berlin", city: "Berlin" },
        { phrase: "Find me the best tours in Dubai", city: "Dubai" },
        { phrase: "What can I do in Berlin?", city: "Berlin" },
        { phrase: "Show me Berlin attractions", city: "Berlin" },
        { phrase: "Find tours in Berlin", city: "Berlin" }
        // ... more default phrases
      ];

      const phrasesToTrain = customPhrases || defaultPhrases;
      let successCount = 0;

      for (const { phrase, city } of phrasesToTrain as {phrase:string, city:string}[]) {
        try {
          const embedding = await this.tourService.embedText(phrase);
          await this.qdrantService.upsertTrainingPhrase(phrase, embedding, city);
          successCount++;
        } catch (error) {
          this.logger.error(`Failed to train phrase: ${phrase}`, error.stack);
        }
      }

      this.lastTrainingDate = new Date();
      this.status = 'completed';
      this.logger.log(`Training completed. Successfully trained ${successCount}/${phrasesToTrain.length} phrases.`);
      
      return {
        success: true,
        trainedCount: successCount,
        totalCount: phrasesToTrain.length,
        date: this.lastTrainingDate
      };
    } catch (error) {
      this.status = 'failed';
      this.logger.error('Training failed:', error.stack);
      throw error;
    }
  }

  getTrainingStatus() {
    return {
      status: this.status,
      lastTrainingDate: this.lastTrainingDate
    };
  }

  // async trainBotWithVariations() {
  //   for (const { phrase, city } of this.trainingPhrases) {
  //     try {
  //       const embedding = await this.tourService.embedText(phrase);
  //       await this.qdrantService.upsertTrainingPhrase(phrase, embedding, city);
  //       this.logger.log(`Trained phrase: ${phrase}`);
  //     } catch (error) {
  //       this.logger.error(`Failed to train phrase: ${phrase}`, error);
  //     }
  //   }
}