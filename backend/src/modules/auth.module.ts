// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from '../services/auth.service';
import { User, UserSchema } from '../schemas/user.schema';
import { AuthController } from '../controllers/auth.controller';
import { GoogleStrategy } from '../strategies/google.strategy';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from '../services/email.service';

@Module({
  imports: [
    ConfigModule, // ⬅️ Make sure this is here
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, EmailService],
  exports: [AuthService],
})
export class AuthModule {}
