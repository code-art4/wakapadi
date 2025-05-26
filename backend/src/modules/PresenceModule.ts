import { PresenceService } from '../services/presence.service';
import { PresenceController } from '../controllers/presence.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [PresenceController],
  providers: [PresenceService],
})
export class PresenceModule {}
