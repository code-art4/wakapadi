import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tour, TourSchema } from '../schemas/tour.schema';
import { TourService } from '../services/tour.service';
import { TourController } from '../controllers/tour.controller';
import { WhoisMessageService } from 'src/services/whois-message.service';
import { WhoisMessageController } from 'src/controllers/whois-message.controller';
import {
  WhoisMessage,
  WhoisMessageSchema,
} from 'src/schemas/whois-message.schema';
import { WhoisGateway } from 'src/gateways/whois.gateway';
import { User, UserSchema } from '../schemas/user.schema';
import { UsersService } from '../services/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WhoisMessage.name, schema: WhoisMessageSchema },
      { name: User.name, schema: UserSchema }, // ✅ ADD THIS LINE
    ]),
  ],
  controllers: [WhoisMessageController],
  providers: [WhoisMessageService, WhoisGateway, UsersService],
  exports: [WhoisMessageService, WhoisGateway], // 👈 THIS is what was missing
})
export class WhoisMessageModule {}
