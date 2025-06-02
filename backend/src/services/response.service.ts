// src/services/response.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConversationContext } from './conversation.service';

@Injectable()
export class ResponseService {
  private readonly logger = new Logger(ResponseService.name);
  
  private readonly greetings = [
    "Hello! I'm your tour assistant. How can I help you today?",
    "Hi there! Ready to explore some amazing tours?",
    "Welcome! I can help you find the best tours in any city.",
    "Hello! Where would you like to visit today?",
    "Hi! Let me help you discover great tours in your destination"
  ];
  
  private readonly farewells = [
    "Goodbye! Happy travels!",
    "See you later! Safe travels!",
    "Bye! Hope you have wonderful tours!",
    "Farewell! Come back if you need more recommendations"
  ];
  
  private readonly thanksResponses = [
    "You're welcome! Enjoy your tours!",
    "Happy to help! Have a great trip!",
    "My pleasure! Let me know if you need anything else"
  ];
  
  private readonly noResultsTemplates = [
    "I couldn't find tours matching your request. Try being more specific about:",
    "No tours found. Maybe try:",
    "Hmm, nothing matches. You could try:"
  ];

  private readonly suggestionTips = [
    "A different location or date",
    "Broader search terms (e.g., 'city tours' instead of 'morning walking tours')",
    "Checking your spelling"
  ];

  getGreeting(): string {
    return this.randomChoice(this.greetings);
  }

  getFarewell(): string {
    return this.randomChoice(this.farewells);
  }

  getThanksResponse(): string {
    return this.randomChoice(this.thanksResponses);
  }

  getNoResultsResponse(city?: string): string {
    const base = this.randomChoice(this.noResultsTemplates);
    const tips = this.suggestionTips.join('\n• ');
    
    return city 
      ? `${base}\n• ${city} - try nearby cities\n• ${tips}`
      : `${base}\n• ${tips}`;
  }

  formatTourResults(tours: any[], context?: ConversationContext): string {
    if (!tours.length) {
      return this.getNoResultsResponse(context?.mentionedCity);
    }

    const cityContext = context?.mentionedCity 
      ? ` in ${context.mentionedCity}` 
      : '';

    let response = `Here are tours I found${cityContext}:\n\n`;
    
    tours.forEach((tour, index) => {
      response += `${index + 1}. ${tour.payload.title}\n`;
      response += `📍 ${tour.payload.location}\n`;
      response += `⭐ Rating: ${tour.payload.rating || 'Not rated'}\n`;
      response += `🔗 ${tour.payload.externalPageUrl}\n\n`;
    });

    response += context?.lastResults
      ? "You can ask about any tour (#) or search for something different."
      : "Would you like details about any of these? (Reply with number)";

    return response;
  }

  getTourDetails(tour: any): string {
    return `🔍 ${tour.payload.title}\n\n` +
      `📍 Location: ${tour.payload.location}\n` +
      `📅 Duration: ${tour.payload.duration || 'Not specified'}\n` +
      `💰 Price: ${tour.payload.price || 'Varies'}\n` +
      `⭐ Rating: ${tour.payload.rating || 'Not rated'}\n` +
      `🔗 Book here: ${tour.payload.externalPageUrl}\n\n` +
      `📝 Description: ${tour.payload.description || 'No description available'}\n\n` +
      `Would you like to know about other tours?`;
  }

  getFollowUpPrompt(): string {
    return "\n\nWhat would you like to do next?\n" +
      "1. See more options\n" +
      "2. Filter by price\n" +
      "3. Search different tours\n" +
      "4. Get directions";
  }

  private randomChoice(options: string[]): string {
    return options[Math.floor(Math.random() * options.length)];
  }
}