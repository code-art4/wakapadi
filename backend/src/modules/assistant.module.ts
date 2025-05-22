import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Assistant, AssistantSchema } from '../schemas/assistant.schema';
import { AssistantService } from '../services/assistant.service';
import { AssistantController } from '../controllers/assistant.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Assistant.name, schema: AssistantSchema },
    ]),
  ],
  providers: [AssistantService],
  controllers: [AssistantController],
})
export class AssistantModule {}
