// src/gateways/bot.gateway.ts
import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Logger } from '@nestjs/common';
  import { Socket } from 'socket.io';
  import { TourService } from '../services/tour.service';
  import { QdrantService } from '../services/qdrant.service';
  import { NLPService } from '../services/nlp.service';
  import { ResponseService } from '../services/response.service';
  import { ConversationService } from '../services/conversation.service';
  import { FeedbackService } from '../services/feedback.service';
  import { ConversationContext } from '../services/conversation.service';
  
  interface BotResponse {
    text: string;
    results?: any[];
    followUp?: boolean;
  }
  
  @WebSocketGateway({
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    },
    path: '/socket.io'
  })
  export class BotGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(BotGateway.name);
    private readonly typingIntervals = new Map<string, NodeJS.Timeout>();
  
    constructor(
      private readonly tourService: TourService,
      private readonly qdrantService: QdrantService,
      private readonly nlpService: NLPService,
      private readonly responseService: ResponseService,
      private readonly conversationService: ConversationService,
      private readonly feedbackService: FeedbackService,
    ) {}
  
    afterInit() {
      this.logger.log('✅ BotGateway initialized');
    }
  
    handleConnection(client: Socket) {
      this.logger.log(`🔌 Client connected: ${client.id}`);
      this.conversationService.clearContext(client.id);
      this.sendWelcomeMessage(client);
    }
  
    handleDisconnect(client: Socket) {
      this.logger.log(`❌ Client disconnected: ${client.id}`);
      this.clearTypingInterval(client.id);
      this.conversationService.clearContext(client.id);
    }
  
    private sendWelcomeMessage(client: Socket) {
      this.simulateTyping(client, true);
      setTimeout(() => {
        client.emit('bot:response', {
          text: this.responseService.getGreeting(),
          followUp: false
        });
        this.simulateTyping(client, false);
      }, 1500);
    }
  
    private clearTypingInterval(clientId: string) {
      const interval = this.typingIntervals.get(clientId);
      if (interval) clearInterval(interval);
      this.typingIntervals.delete(clientId);
    }
  
    private simulateTyping(client: Socket, isTyping: boolean) {
      this.clearTypingInterval(client.id);
      
      if (isTyping) {
        const interval = setInterval(() => {
          client.emit('bot:typing', true);
        }, 2000);
        this.typingIntervals.set(client.id, interval);
      } else {
        client.emit('bot:typing', false);
      }
    }
  
    @SubscribeMessage('bot:message')
    async handleBotMessage(
      @MessageBody() message: { message: string },
      @ConnectedSocket() client: Socket,
    ) {
      const text = message.message?.trim();
      
      if (!text) {
        return this.sendEmptyMessageResponse(client);
      }
  
      try {
        this.simulateTyping(client, true);
        const context = this.conversationService.getContext(client.id);
        const { intent, entities } = await this.nlpService.detectIntent(text);
        this.logger.debug(`Detected intent: ${intent}`, { entities });
  
        const followUpResponse = await this.handleFollowUpIfNeeded(client, text, context);
        if (followUpResponse) return followUpResponse;
  
        return this.processIntent(client, text, intent, entities);
      } catch (error) {
        this.logger.error(`Message processing error: ${error.message}`, error.stack);
        return this.sendErrorMessage(client);
      } finally {
        this.simulateTyping(client, false);
      }
    }
  
    private async handleFollowUpIfNeeded(client: Socket, text: string, context: ConversationContext) {
      if (context.lastIntent === 'tour_search' && context.lastResults) {
        const tourMatch = text.match(/(\d+)/);
        if (tourMatch) {
          const response = this.handleTourFollowUp(tourMatch[1], context.lastResults);
          client.emit('bot:response', response);
          return true;
        }
      }
      return false;
    }
  
    private processIntent(client: Socket, text: string, intent: string, entities: { city?: string }) {
      switch (intent) {
        case 'greeting':
          return client.emit('bot:response', {
            text: this.responseService.getGreeting(),
            followUp: false
          });
  
        case 'farewell':
          return client.emit('bot:response', {
            text: this.responseService.getFarewell(),
            followUp: false
          });
  
        case 'thanks':
          return client.emit('bot:response', {
            text: this.responseService.getThanksResponse(),
            followUp: false
          });
  
        case 'tour_search':
          return this.handleTourSearch(client, text, entities.city || ''); // Ensure city is never undefined
  
        default:
          return client.emit('bot:response', {
            text: "I specialize in finding tours. Try something like: 'Find historical tours in Berlin'",
            followUp: false
          });
      }
    }
  
    private sendEmptyMessageResponse(client: Socket) {
      this.logger.warn('Received empty message');
      return client.emit('bot:response', {
        text: "Please type a message to get tour recommendations",
        followUp: false
      });
    }
  
    private sendErrorMessage(client: Socket) {
      return client.emit('bot:response', {
        text: "⚠️ Our system is currently unavailable. Please try again later.",
        followUp: false
      });
    }
  
    private handleTourFollowUp(tourNumber: string, lastResults: any[]): BotResponse {
      const tourIndex = parseInt(tourNumber, 10) - 1;
      
      if (isNaN(tourIndex)) {
        return {
          text: "Please specify a valid tour number",
          followUp: true
        };
      }
  
      if (tourIndex < 0 || tourIndex >= lastResults.length) {
        return {
          text: "That tour number doesn't exist. Please choose from the list.",
          followUp: true
        };
      }
  
      const tour = lastResults[tourIndex];
      return {
        text: this.responseService.getTourDetails(tour),
        followUp: true
      };
    }
  
    private async handleTourSearch(client: Socket, query: string, city: string) {
      const context = this.conversationService.getContext(client.id);
      const searchCity = city || context.mentionedCity || ''; // Ensure searchCity is never undefined
      
      try {
        const embeddingVector = await this.tourService.embedText(query);
        this.logger.debug(`Generated embedding for query: ${query}`);
  
        const results = await this.qdrantService.searchSimilarTours(
          embeddingVector,
          5,
          0.6,
        );
  
        this.updateConversationContext(client.id, searchCity, results);
  
        if (!results.length) {
          return client.emit('bot:response', {
            text: this.responseService.getNoResultsResponse(searchCity),
            followUp: true
          });
        }
       
        return client.emit('bot:response', {
          text: this.responseService.formatTourResults(results, { mentionedCity: searchCity }),
          results,
          followUp: true
        });
    
    
      } catch (error) {
        this.logger.error(`Tour search failed: ${error.message}`, error.stack);
        throw error;
      }
    }
  
    private updateConversationContext(clientId: string, city: string, results: any[]) {
      this.conversationService.updateContext(clientId, {
        lastIntent: 'tour_search',
        mentionedCity: city,
        lastResults: results
      });
    }
  
    @SubscribeMessage('bot:feedback')
    async handleFeedback(
      @MessageBody() feedback: { 
        messageId: string; 
        isHelpful: any; 
        text?: any 
      },
      @ConnectedSocket() client: Socket,
    ) {
      try {
        await this.feedbackService.recordFeedback(
          client.id,
          feedback.messageId,
          feedback.isHelpful,
          feedback.text
        );
        client.emit('bot:feedbackReceived', { success: true });
      } catch (error) {
        this.logger.error('Feedback recording failed:', error);
        client.emit('bot:feedbackReceived', { 
          success: false,
          error: 'Failed to record feedback' 
        });
      }
    }
  }