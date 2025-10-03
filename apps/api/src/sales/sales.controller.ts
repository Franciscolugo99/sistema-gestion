import { Body, Controller, Post } from '@nestjs/common';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(private svc: SalesService) {}

  @Post()
  create(@Body() body: any) {
    return this.svc.create(body); // delega en el service
  }
}
