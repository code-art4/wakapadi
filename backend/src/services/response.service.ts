import { Injectable, Logger } from '@nestjs/common';
import { ConversationContext } from './conversation.service';

interface Tour {
  payload: {
    title: string;
    location: string;
    rating?: number;
    externalPageUrl: string;
    duration?: string;
    price?: string;
    description?: string;
    category?: string;
    maxGroupSize?: number;
    languages?: string[];
    highlights?: string[];
  };
}

@Injectable()
export class ResponseService {
  private readonly logger = new Logger(ResponseService.name);

  // === Templates ===
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

  private readonly errorResponses = [
    "I encountered an issue processing your request. Please try again later.",
    "Something went wrong on my end. Let's try that again.",
    "Apologies, I'm having trouble with that. Maybe try a different query?"
  ];

  // === Public Response Builders ===

  getGreeting(): string {
    this.logger.log('Generating greeting message');
    return this.randomChoice(this.greetings);
  }

  getFarewell(): string {
    this.logger.log('Generating farewell message');
    return this.randomChoice(this.farewells);
  }

  getThanksResponse(): string {
    this.logger.log('Generating thanks response');
    return this.randomChoice(this.thanksResponses);
  }

  getNoResultsResponse(city?: string): string {
    this.logger.log(`Generating no results response for city: ${city || 'unspecified'}`);
    const base = this.randomChoice(this.noResultsTemplates);
    const tips = this.suggestionTips.join('\n• ');

    let locationSpecificTip = '';
    if (city) {
      locationSpecificTip = `• ${this.formatCityName(city)} - try nearby cities\n`;
    }

    return `${base}\n${locationSpecificTip}• ${tips}`;
  }

  getErrorResponse(): string {
    this.logger.error('Generating error response');
    return this.randomChoice(this.errorResponses);
  }

  getFollowUpPrompt(): string {
    this.logger.log('Generating default follow-up prompt');
    return "\n\nWhat would you like to do next?\n" +
      "1. See more options\n" +
      "2. Filter by price\n" +
      "3. Search different tours\n" +
      "4. Get directions\n" +
      "5. Contact support";
  }

  getDynamicFollowUp(options: string[]): string {
    return "\n\nWhat would you like to do next?\n" +
      options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
  }

  getFallbackFromTrainingPhrase(phrase: string, city: string): string {
    return `I wasn't entirely sure, but this question has helped others:\n` +
      `"${phrase}" in ${this.formatCityName(city)}.\n` +
      `Let me show you what I found based on that.`;
  }

  formatTourResults(tours: Tour[], context?: ConversationContext): string {
    this.logger.log(`Formatting ${tours.length} tour results`);

    if (!tours.length) {
      return this.getNoResultsResponse(context?.mentionedCity);
    }

    const cityContext = context?.mentionedCity
      ? ` in ${this.formatCityName(context.mentionedCity)}`
      : '';

    let response = `Here ${tours.length === 1 ? 'is' : 'are'} ${tours.length} ${this.pluralize('tour', tours.length)} I found${cityContext}:\n\n`;

    response += tours.map((tour, index) => {
      const ratingDisplay = tour.payload.rating
        ? `${tour.payload.rating.toFixed(1)} ★`
        : 'Not rated';

      return `${index + 1}. ${tour.payload.title}\n` +
        `📍 ${tour.payload.location}\n` +
        `⭐ ${ratingDisplay}\n` +
        `🔗 ${this.shortenUrl(tour.payload.externalPageUrl)}\n`;
    }).join('\n');

    response += '\n\n' + (
      context?.lastResults
        ? "You can ask about any tour (#) or search for something different."
        : "Would you like details about any of these? (Reply with number)"
    );

    return response;
  }

  getTourDetails(tour: Tour): string {
    this.logger.log(`Generating details for tour: ${tour.payload.title}`);

    const ratingDisplay = tour.payload.rating
      ? `${tour.payload.rating.toFixed(1)} ★ (${this.getRatingDescription(tour.payload.rating)})`
      : 'Not rated';

    const highlights = tour.payload.highlights?.length
      ? `\n🌟 Highlights:\n${tour.payload.highlights.map(h => `• ${h}`).join('\n')}\n`
      : '';

    return `🔍 ${tour.payload.title}\n\n` +
      `📍 Location: ${tour.payload.location}\n` +
      `📅 Duration: ${tour.payload.duration || 'Not specified'}\n` +
      `💰 Price: ${this.formatPrice(tour.payload.price)}\n` +
      `⭐ Rating: ${ratingDisplay}\n` +
      `👥 Group size: ${tour.payload.maxGroupSize ? `Up to ${tour.payload.maxGroupSize}` : 'Not specified'}\n` +
      `🗣️ Languages: ${tour.payload.languages?.join(', ') || 'Not specified'}\n` +
      `🔗 Book here: ${this.shortenUrl(tour.payload.externalPageUrl)}\n` +
      highlights +
      `\n📝 Description: ${tour.payload.description || 'No description available'}\n\n` +
      `Would you like to know about other tours?`;
  }

  formatTourCard(tour: Tour) {
    return {
      title: tour.payload.title,
      location: tour.payload.location,
      rating: tour.payload.rating || null,
      price: this.formatPrice(tour.payload.price),
      url: tour.payload.externalPageUrl,
      shortDescription: tour.payload.description?.slice(0, 120),
      city: tour.payload.location
    };
  }

  // === Utility Methods ===

  private randomChoice(options: string[]): string {
    return options[Math.floor(Math.random() * options.length)];
  }

  private pluralize(word: string, count: number): string {
    return count === 1 ? word : `${word}s`;
  }

  private formatCityName(city: string): string {
    return city.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private shortenUrl(url: string): string {
    try {
      const parsed = new URL(url);
      return `${parsed.hostname}${parsed.pathname.length > 15 ? '...' : parsed.pathname}`;
    } catch {
      return url;
    }
  }

  private formatPrice(price?: string): string {
    if (!price) return 'Varies';
    if (/^\d+$/.test(price)) return `$${price}`;
    return price;
  }

  private getRatingDescription(rating: number): string {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Very Good';
    if (rating >= 3.5) return 'Good';
    if (rating >= 3.0) return 'Average';
    return 'Below average';
  }
}
