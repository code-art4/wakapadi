// // src/services/llm.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
@Injectable()
export class LLMService {
  async generateResponse(prompt: string): Promise<string> {
    try {
      const res = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'deepseek/deepseek-chat:free',
          messages: [
            { role: 'system', content: 'You are a helpful travel assistant.' },
            { role: 'user', content: prompt },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return res.data.choices?.[0]?.message?.content?.trim() ?? 'No response.';
    } catch (err: any) {
      console.error('[LLMService] OpenRouter Error:', err.message);
      return 'Error reaching language model.';
    }
  }
}
