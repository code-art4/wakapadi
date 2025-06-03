// src/services/nlp.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { QdrantService } from './qdrant.service'; // Inject this in NLPService
import { TourService } from './tour.service';
import { LLMService } from './llm.service';

interface IntentResult {
  intent: string;
  entities: {
    city?: string;
    activity?: string;
    number?: number;
    date?: string;
    priceRange?: string;
  };
  response?: string;
  isLLMFallback?: boolean;
}


@Injectable()
export class NLPService {
  constructor(
    private readonly qdrantService: QdrantService,
    private readonly tourService: TourService,
    private readonly llmService: LLMService
    ) {}
  
  private readonly logger = new Logger(NLPService.name);
  
  // Enhanced intent detection patterns
  private readonly intentPatterns = {
    greeting: [
      /^(hello|hi|hey|greetings|welcome|good\s(morning|afternoon|evening))\b/i,
      /^(what's\sup|how\sare\syou)\b/i
    ],
    farewell: [
      /^(bye|goodbye|see\sya?|later|exit|quit|stop)\b/i,
      /^(take\scare|have\sa\sgood\s(day|night))\b/i
    ],
    thanks: [
      /^(thanks|thank\syou|appreciate|cheers|thx|ty)\b/i,
      /^(much\sappreciated|you're\sthe\sbest)\b/i
    ],
    help: [
      /^(help|support|what\scan\syou\sdo|options)\b/i
    ],
    tourSearch: [
      /(find|search|look|want|need|book|reserve|recommend|suggest|explore|discover)\b.*\b(tour|activity|visit|see|do|experience|guide|walking|sightseeing|attraction|excursion)\b/i,
      /(what|where|which|how|can).*(to\s)?(do|see|visit|experience|explore)\b/i,
      /(best|top|good|great|interesting).*(to\s)?(do|see|visit)\b/i
    ],
    tourDetail: [
      /^(show|details|about|more|info|information)\b.*\b(\d+)\b/i,
      /^(tell|give)\s(me\s)?(more|details)\b.*\b(\d+)\b/i
    ]
  };

  private readonly entityKeywords = {
    tourTypes: new Set([
      'tour', 'tours', 'activity', 'activities', 'visit', 'visits',
      'see', 'do', 'experience', 'guide', 'walking', 'sightseeing',
      'attraction', 'attractions', 'excursion', 'excursions',
      'museum', 'historical', 'adventure', 'food', 'culinary',
      'shopping', 'nightlife', 'cultural', 'art', 'architecture'
    ]),
    verbs: new Set([
      'find', 'search', 'look', 'want', 'need', 'book', 'reserve',
      'recommend', 'suggest', 'explore', 'discover', 'show', 'tell',
      'give', 'see', 'visit', 'experience'
    ]),
    cities: new Set([
      'paris', 'london', 'new york', 'tokyo', 'rome', 'barcelona',
      'berlin', 'amsterdam', 'dubai', 'sydney', 'san francisco'
    ]),
    priceIndicators: new Set([
      'cheap', 'affordable', 'budget', 'expensive', 'luxury',
      'price', 'cost', '$', '€', '£'
    ]),
    timeIndicators: new Set([
      'today', 'tomorrow', 'weekend', 'morning', 'afternoon',
      'evening', 'night', 'next week', 'this month'
    ])
  };

  detectIntent(text: string): IntentResult {
    if (!text?.trim()) {
      this.logger.warn('Received empty text for intent detection');
      return { intent: 'unknown', entities: {} };
    }

    const cleanText = text.trim();
    const lowerText = cleanText.toLowerCase();
    this.logger.debug(`Processing text: "${cleanText}"`);

    // Check for basic intents first
    const basicIntent = this.checkBasicIntents(lowerText);
    if (basicIntent) return basicIntent;

    // Extract entities with improved logic
    const entities = this.extractEntities(cleanText, lowerText);
    this.logExtraction(cleanText, entities);
    if(entities.activity!=="tour"){
      return {intent:"unknown", entities}
    }
    // Check for tour detail request (e.g., "show me #3")
    const tourDetailIntent = this.checkTourDetailIntent(lowerText);
    if (tourDetailIntent) return tourDetailIntent;

    // Determine if this is a tour-related query
    if (this.isTourQuery(lowerText, entities)) {
      return { intent: 'tour_search', entities };
    }

    this.logger.warn(`Could not determine intent for: "${cleanText}"`);
    return { intent: 'unknown', entities: {} };
  }

  private checkBasicIntents(text: string): IntentResult | null {
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      if (patterns.some(p => p.test(text))) {
        return { intent, entities: {} };
      }
    }
    return null;
  }

  private extractEntities(fullText: string, lowerText: string): IntentResult['entities'] {
    return {
      city: this.extractCity(fullText, lowerText),
      activity: this.extractActivity(fullText, lowerText),
      number: this.extractNumber(lowerText),
      date: this.extractDate(lowerText),
      priceRange: this.extractPriceRange(lowerText)
    };
  }

  private extractCity(fullText: string, lowerText: string): string | undefined {
    // Try structured patterns first
    const cityPatterns = [
      /(?:in|at|near|around|for|within|inside|outside|close\sto)\s+(?:the\s+)?([a-z][a-z\s]+?)(?=\s|$|[,.!?])/i,
      /(?:from|to|going\sto|visiting|destination)\s+(?:the\s+)?([a-z][a-z\s]+?)(?=\s|$|[,.!?])/i
    ];

    for (const pattern of cityPatterns) {
      const match = lowerText.match(pattern);
      if (match?.[1]) {
        return this.formatCityName(match[1].trim());
      }
    }

    // Fallback to known cities or longest capitalized word
    const words = fullText.split(/\s+/);
    const possibleCities = words.filter(word => 
      word.length > 3 && 
      (this.entityKeywords.cities.has(word.toLowerCase()) || 
       /^[A-Z][a-z]+$/.test(word))
    );

    if (possibleCities.length) {
      return this.formatCityName(
        possibleCities.sort((a, b) => b.length - a.length)[0]
      );
    }

    return undefined;
  }

  private extractActivity(fullText: string, lowerText: string): string | undefined {
    // Try structured patterns
    const activityPatterns = [
      /(?:looking\sfor|want|find|searching\sfor|interested\sin|need|book|reserve)\s+([a-z][a-z\s]+?)(?=\s|$|[,.!?])/i,
      /(?:show\sme|recommend|suggest)\s+([a-z][a-z\s]+?)(?=\s|$|[,.!?])/i
    ];

    for (const pattern of activityPatterns) {
      const match = lowerText.match(pattern);
      if (match?.[1]) {
        const activity = match[1].trim();
        if (this.isValidActivity(activity)) {
          return activity;
        }
      }
    }

    // Fallback to keyword matching
    const words = fullText.split(/\s+/);
    const activityKeywords = words.filter(word => 
      this.entityKeywords.tourTypes.has(word.toLowerCase())
    );

    if (activityKeywords.length) {
      return activityKeywords.join(' ');
    }

    return undefined;
  }

  private extractNumber(text: string): number | undefined {
    const match = text.match(/\b(\d+)\b/);
    return match ? parseInt(match[1], 10) : undefined;
  }

  private extractDate(text: string): string | undefined {
    const datePatterns = [
      /(today|tomorrow|this weekend|next week)/i,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?/i,
      /\d{1,2}[\/\-]\d{1,2}[\/\-]?\d{0,4}/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match?.[0]) {
        return match[0];
      }
    }
    return undefined;
  }

  private extractPriceRange(text: string): string | undefined {
    const pricePatterns = [
      /(cheap|affordable|budget|expensive|luxury)/i,
      /(under|below|less\sthan)\s(\$|€|£)?\d+/i,
      /(\$|€|£)\d+\s?-\s?(\$|€|£)?\d+/i
    ];

    for (const pattern of pricePatterns) {
      const match = text.match(pattern);
      if (match?.[0]) {
        return match[0];
      }
    }
    return undefined;
  }

  private checkTourDetailIntent(text: string): IntentResult | null {
    const detailPatterns = [
      /^(show|details|about|more|info|information)\b.*\b(\d+)\b/i,
      /^(tell|give)\s(me\s)?(more|details)\b.*\b(\d+)\b/i,
      /^#?(\d+)\b/i
    ];

    for (const pattern of detailPatterns) {
      const match = text.match(pattern);
      if (match) {
        const number = parseInt(match[match.length - 1], 10);
        if (!isNaN(number)) {
          return { 
            intent: 'tour_detail', 
            entities: { number } 
          };
        }
      }
    }
    return null;
  }

  private isTourQuery(text: string, entities: IntentResult['entities']): boolean {
    // Check for explicit tour keywords
    if ([...this.entityKeywords.tourTypes].some(kw => text.includes(kw))) {
      return true;
    }

    // Check for activity verbs
    if ([...this.entityKeywords.verbs].some(verb => text.includes(verb))) {
      return true;
    }

    // Check for question patterns
    if (/(what|where|which|how|can).*(to\s)?(do|see|visit|experience|explore)/i.test(text)) {
      return true;
    }

    // If we already detected relevant entities, likely a tour search
    return !!entities.city || !!entities.activity || !!entities.date || !!entities.priceRange;
  }

  private isValidActivity(activity: string): boolean {
    const words = activity.toLowerCase().split(/\s+/);
    return words.some(word => 
      this.entityKeywords.tourTypes.has(word) || 
      this.entityKeywords.verbs.has(word)
    );
  }

  private formatCityName(city: string): string {
    return city.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private logExtraction(text: string, entities: IntentResult['entities']) {
    // if(entities.activity!=="tour"){
    //   const response = await this.llmService.generateResponse(
    //     `User said: "${text}". Provide a helpful travel/tour assistant response.`
    //   );
  
    // }
    this.logger.debug(`Extracted from "${text}":`, JSON.stringify(entities, null, 2));
  }



  async detectIntentWithFallback(text: string): Promise<IntentResult> {
    const result = this.detectIntent(text);

    if (result.intent !== 'unknown') {
      return result;
    }

    // Fallback to training phrases in Qdrant
    const embedding = await this.tourService.embedText(text);
    const similar = await this.qdrantService.findSimilarTrainingPhrases(embedding, 1);

    if (similar.length && similar[0].score > 0.7) {
      const city = similar[0].payload.city;
      this.logger.debug(`Fallback NLP match from Qdrant: ${similar[0].payload.phrase} → intent: tour_search, city: ${city}`);
      return { intent: 'tour_search', entities: { city } };
    }

    // Final fallback to LLM
    const response = await this.llmService.generateResponse(
      `User said: "${text}". Provide a helpful travel/tour assistant response.`
    );

    return {
      intent: 'unknown',
      entities: {},
      response,
      isLLMFallback: true
    };
  }
}