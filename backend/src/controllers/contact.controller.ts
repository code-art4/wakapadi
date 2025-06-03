// src/contact/contact.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { ContactService } from '../services/contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async createMessage(@Body() dto: any) {
    return this.contactService.create(dto);
  }
}
