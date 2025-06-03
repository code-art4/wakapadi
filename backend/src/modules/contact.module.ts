// src/contact/contact.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactController } from '../controllers/contact.controller';
import { ContactMessage, ContactMessageSchema } from '../schemas/contact-message.schema';
import { ContactService } from '../services/contact.service';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContactMessage.name, schema: ContactMessageSchema },
    ]),
  ],
  controllers: [ContactController],
  providers: [ContactService],
//   exports: [ContactService], // Optional: export if used in other modules
})
export class ContactModule {}
