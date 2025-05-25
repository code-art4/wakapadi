// src/services/auth.service.ts
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { User } from '../schemas/user.schema';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

type UserDocument = User & Document & { _id: string };

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async register({ email, password, username }) {
    if (!email || !password || !username) {
      throw new BadRequestException('Email, password, and username are required');
    }
  
    const hash = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({ email, password: hash, username });
    return { token: this.signToken(user._id, username) };
  }
  

  async login({ email, password }) {
    const user = await this.userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { token: this.signToken(user._id, user.username) };
  }

  private signToken(id: string, username: string) {
    return jwt.sign({ id, username }, JWT_SECRET, { expiresIn: '7d' });
  }
}
