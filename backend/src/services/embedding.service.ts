// embedding.service.ts (NestJS)
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EmbeddingService {
  async embed(text: string): Promise<number[]> {
    const res = await axios.post('http://116.203.158.7:5050/embed', { text });
    return res.data.vector;
  }
}
