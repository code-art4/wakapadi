import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WhoisController } from '../controllers/whois.controller';
import { WhoisService } from '../services/whois.service';
import { Presence, PresenceSchema } from '../schemas/presence.schema';


@Module({
  imports: [MongooseModule.forFeature([{ name: Presence.name, schema: PresenceSchema }])],
  providers: [WhoisService],
  controllers: [WhoisController],

})
export class WhoisModule {}
