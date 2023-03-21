import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { IEmployee } from './utils/types';

@Controller("/api")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/all")
  getAllEmployees(): IEmployee[] {
    return this.appService.getEmployee();
  }
}
