import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { TourModule } from './modules/tour.module';
import { ScraperModule } from './modules/scraper.module';
import { AssistantModule } from './modules/assistant.module';
import { WhoisModule } from './modules/whois.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SeedModule } from './modules/seed.module';
import { UserModule } from './modules/users.module';
import { AuthModule } from './modules/auth.module';
import { WhoisMessageModule } from './modules/whois-message.module';
import { PresenceModule } from './modules/PresenceModule';
import { ConfigModule } from '@nestjs/config';
import { CityModule } from './modules/city.module';
import { QdrantService } from './services/qdrant.service';
import { EmbeddingService } from './services/embedding.service';
import { BotGateway } from './gateways/bot.gateway';
import { NLPService } from './services/nlp.service';
import { ResponseService } from './services/response.service';
import { ConversationService } from './services/conversation.service';
import { FeedbackModule } from './modules/feedback.module';
import { TrainingModule } from './modules/training.module';
import { LLMService } from './services/llm.service';
import { ContactModule } from './modules/contact.module';
import { GeolocationModule } from './modules/geolocation..module';

@Module({
  imports: [
    // MongooseModule.forRoot('mongodb://localhost/wakapadi'),
    ConfigModule.forRoot({ isGlobal: true }),

    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI!),
    AssistantModule,
    TourModule,
    FeedbackModule,
    ScraperModule,
    WhoisMessageModule,
    AuthModule,
    SeedModule,
    UserModule,
    CityModule,
    PresenceModule,
    TrainingModule,
    WhoisModule,
    ContactModule,
    GeolocationModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EmbeddingService,
    QdrantService,
    BotGateway,
    NLPService,
    ResponseService,
    ConversationService,
    LLMService,
  ],
})
export class AppModule {}
