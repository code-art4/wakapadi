import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { AssistantService } from '../services/assistant.service';
import { CreateAssistantDto } from '../types/assistant.dto';

@Controller('assistants')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post()
  create(@Body() body: CreateAssistantDto) {
    return this.assistantService.create(body);
  }

  @Get()
  findAll(@Query('location') location?: string) {
    return this.assistantService.findAll(location);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.assistantService.findById(id);
  }
}
