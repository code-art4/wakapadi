// src/services/feedback.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feedback, FeedbackDocument } from '../schemas/feedback.schema';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
  ) {}

  async recordFeedback(
    sessionId: string,
    message: string,
    response: string,
    isHelpful: boolean,
    feedbackText?: string,
  ) {
    const feedback = new this.feedbackModel({
      sessionId,
      message,
      response,
      isHelpful,
      feedbackText,
      timestamp: new Date(),
    });
    
    await feedback.save();
  }

  async analyzeFeedback() {
    // Implement feedback analysis to improve responses
    const helpfulCount = await this.feedbackModel.countDocuments({ isHelpful: true });
    const unhelpfulCount = await this.feedbackModel.countDocuments({ isHelpful: false });
    
    return {
      helpfulCount,
      unhelpfulCount,
      helpfulPercentage: (helpfulCount / (helpfulCount + unhelpfulCount)) * 100,
    };
  }
}