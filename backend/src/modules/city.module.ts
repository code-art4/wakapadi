// src/user/city.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CityService } from '../services/city.services';
import { CityController } from '../controllers/city.controller';
import { City, CitySchema } from '../schemas/city.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: City.name, schema: CitySchema }]),
    
  ],
  controllers: [CityController],
  providers: [CityService],
  exports: [MongooseModule],
})
export class CityModule {}
