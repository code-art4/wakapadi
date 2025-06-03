// src/contact/contact.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateContactDto } from 'src/types/create-contact.dto';
import { ContactMessage, ContactMessageDocument } from '../schemas/contact-message.schema';

// src/contact/contact.service.ts
@Injectable()
export class ContactService {
  constructor(@InjectModel(ContactMessage.name) private model: Model<ContactMessageDocument>) {}

  async create(dto: CreateContactDto) {
    return this.model.create(dto);
  }

  async findAll() {
    return this.model.find().sort({ createdAt: -1 }).exec(); // for dashboard
  }
}
