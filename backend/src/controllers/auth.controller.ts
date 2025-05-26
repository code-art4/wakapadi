// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, UseGuards, Req, Patch } from '@nestjs/common';
import { AuthGuard } from 'src/gateways/auth.guard';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get('me')
  @UseGuards(AuthGuard)
async getProfile(@Req() req) {
  const user = await this.authService.findUserById(req.user.id);
  return user;
}

  @Post('register')
  register(@Body() body) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body) {
    return this.authService.login(body);
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  async updateProfile(@Req() req, @Body() body) {
    return this.authService.updateProfile(req.user.id, body);
  }
}
