// src/services/conversation.service.ts
import { Injectable } from '@nestjs/common';

export interface ConversationContext {
  lastIntent?: string;
  mentionedCity?: string;
  mentionedActivity?: string;
  lastResults?: any[];
}

@Injectable()
export class ConversationService {
  private conversations = new Map<string, ConversationContext>();

  getContext(clientId: string): ConversationContext {
    if (!this.conversations.has(clientId)) {
      this.conversations.set(clientId, {});
    }
    return this.conversations.get(clientId)!;
  }

  updateContext(clientId: string, updates: Partial<ConversationContext>) {
    const context = this.getContext(clientId);
    this.conversations.set(clientId, { ...context, ...updates });
  }

  clearContext(clientId: string) {
    this.conversations.delete(clientId);
  }
}