// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from 'src/gateways/auth.guard';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get('me')
  @UseGuards(AuthGuard)
  getProfile(@Req() req) {
    return req.user;
  }
  
  @Post('register')
  register(@Body() body) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body) {
    return this.authService.login(body);
  }
}