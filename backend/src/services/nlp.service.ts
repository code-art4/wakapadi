// src/services/nlp.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NLPService {
  private readonly logger = new Logger(NLPService.name);
  
  // Intent detection patterns
  private readonly greetingPatterns = [
    /^hello$|^hi$|^hey$|^greetings$|^welcome$|^good\s(morning|afternoon|evening)$/i
  ];
  
  private readonly farewellPatterns = [
    /^bye$|^goodbye$|^see\syou$|^later$|^exit$|^quit$/i
  ];
  
  private readonly thanksPatterns = [
    /^thanks$|^thank\syou$|^appreciate$|^cheers$/i
  ];
  
  private readonly tourKeywords = new Set([
    'tour', 'tours', 'activity', 'activities', 'visit', 'visits',
    'see', 'do', 'experience', 'guide', 'walking', 'sightseeing',
    'attraction', 'attractions', 'excursion', 'excursions'
  ]);

  private readonly activityVerbs = new Set([
    'find', 'search', 'look', 'want', 'need', 'book', 'reserve',
    'recommend', 'suggest', 'explore', 'discover'
  ]);

  detectIntent(text: string): { intent: string; entities: { city?: string; activity?: string } } {
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

    // Determine if this is a tour-related query
    if (this.isTourQuery(lowerText, entities)) {
      return { intent: 'tour_search', entities };
    }

    // Fallback to location-only search if city is detected
    if (entities.city) {
      return { 
        intent: 'tour_search', 
        entities: { city: entities.city } 
      };
    }

    this.logger.warn(`Could not determine intent for: "${cleanText}"`);
    return { intent: 'unknown', entities: {} };
  }

  private checkBasicIntents(text: string) {
    if (this.greetingPatterns.some(p => p.test(text))) {
      return { intent: 'greeting', entities: {} };
    }
    if (this.farewellPatterns.some(p => p.test(text))) {
      return { intent: 'farewell', entities: {} };
    }
    if (this.thanksPatterns.some(p => p.test(text))) {
      return { intent: 'thanks', entities: {} };
    }
    return null;
  }

  private extractEntities(fullText: string, lowerText: string): { city?: string; activity?: string } {
    // Try structured patterns first
    const structured = this.extractStructuredEntities(lowerText);
    if (structured.city || structured.activity) {
      return structured;
    }

    // Fallback to keyword analysis for simple queries
    return this.analyzeKeywords(fullText, lowerText);
  }

  private extractStructuredEntities(text: string) {
    // Enhanced city extraction with support for more patterns
    const cityMatch = text.match(
      /(?:in|at|near|around|for|within|inside|outside|close\sto)\s+(?:the\s+)?([a-z][a-z\s]+?)(?=\s|$|[,.!?])/i
    );
    
    // Enhanced activity extraction
    const activityMatch = text.match(
      /(?:looking\sfor|want|find|searching\sfor|interested\sin|need|book|reserve)\s+([a-z][a-z\s]+?)(?=\s|$|[,.!?])/i
    );

    return {
      city: cityMatch?.[1]?.trim(),
      activity: activityMatch?.[1]?.trim()
    };
  }

  private analyzeKeywords(fullText: string, lowerText: string) {
    const words = fullText.split(/\s+/);
    const keywords = new Set(words.map(w => w.toLowerCase()));
    
    // Find the most likely city (longest non-keyword)
    let city = words
      .filter(w => w.length > 3 && !this.tourKeywords.has(w.toLowerCase()))
      .sort((a, b) => b.length - a.length)[0];
    
    // Find activity terms (either keywords or verb-noun combinations)
    let activity = [...keywords].filter(k => this.tourKeywords.has(k)).join(' ') ||
                  this.findActivityPhrase(words);

    return {
      city: city || undefined,
      activity: activity || undefined
    };
  }

  private findActivityPhrase(words: string[]): string | undefined {
    for (let i = 0; i < words.length - 1; i++) {
      const current = words[i].toLowerCase();
      const next = words[i + 1].toLowerCase();
      
      if (this.activityVerbs.has(current) && this.tourKeywords.has(next)) {
        return `${current} ${next}`;
      }
    }
    return undefined;
  }

  private isTourQuery(text: string, entities: { city?: string; activity?: string }): boolean {
    // Check for explicit tour keywords
    if ([...this.tourKeywords].some(kw => text.includes(kw))) {
      return true;
    }

    // Check for activity verbs
    if ([...this.activityVerbs].some(verb => text.includes(verb))) {
      return true;
    }

    // Check for question patterns
    if (/(what|where|which|how|can).*(to\s)?(do|see|visit|experience|explore)/i.test(text)) {
      return true;
    }

    // If we already detected entities, likely a tour search
    return !!entities.city || !!entities.activity;
  }

  private logExtraction(text: string, entities: any) {
    this.logger.debug(`Extracted from "${text}":`, {
      city: entities.city || 'none',
      activity: entities.activity || 'none'
    });
  }
}