// src/seed/seed.controller.ts
import { Controller, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Controller('seed')
export class SeedController {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  @Post('users')
  async seedUsers() {
    const users = [
      { username: 'Alice', email: 'alice@example.com', password: 'test123', role: 'tourist' },
      { username: 'Bob', email: 'bob@example.com', password: 'test123', role: 'tourist' },
      { username: 'Carlos', email: 'carlos@example.com', password: 'test123', role: 'assistant' },
      { username: 'Diana', email: 'diana@example.com', password: 'test123', role: 'tourist' },
    ];

    await this.userModel.deleteMany({ email: { $in: users.map(u => u.email) } });

    const hashedUsers = await Promise.all(users.map(async (u) => {
      const hash = require('bcrypt').hashSync(u.password, 10);
      return { ...u, password: hash };
    }));

    return this.userModel.insertMany(hashedUsers);
  }
}
