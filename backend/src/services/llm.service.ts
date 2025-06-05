// src/services/llm.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LLMService {
  async generateResponse(prompt: string): Promise<string> {
    try {
      const res = await axios.post('http://116.203.158.7:11434/api/generate', {
        model: 'gemma:2b', // or mixtral, gemma, etc.
        prompt,
        stream: false
      });
      return res.data.response?.trim() || 'Sorry, I had trouble answering that.';
    } catch (err) {
      console.error('[LLMService] Error communicating with Ollama:', err.message);
      return 'Sorry, I could not reach my language model at the moment.';
    }
  }
}

