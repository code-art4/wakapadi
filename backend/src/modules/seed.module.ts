// src/seed/seed.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedWhoisController } from '../controllers/seed-whois.controller';
import { WhoisPresence, WhoisPresenceSchema } from '../schemas/whois.schema';
import { SeedController } from '../controllers/seed.controller';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: WhoisPresence.name, schema: WhoisPresenceSchema }])

  ],
  controllers: [SeedController, SeedWhoisController],
})
export class SeedModule {}
