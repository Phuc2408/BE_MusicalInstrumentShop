import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import Redis from 'ioredis';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService)
   {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
