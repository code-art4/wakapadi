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

@Module({
  imports: [
    // MongooseModule.forRoot('mongodb://localhost/wakapadi'),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot('mongodb://localhost:27017/wakapadi'),
    AssistantModule,
    TourModule,
    ScraperModule,
    WhoisMessageModule,
    AuthModule,
    SeedModule,
    UserModule,
    PresenceModule,
    WhoisModule, // ✅ Add this line

  ], 
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


