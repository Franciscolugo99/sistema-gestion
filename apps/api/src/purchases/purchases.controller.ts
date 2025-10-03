import { Body, Controller, Post } from '@nestjs/common';
import { PurchasesService } from './purchases.service';

@Controller('purchases')
export class PurchasesController {
  constructor(private svc: PurchasesService) {}

  @Post()
  create(@Body() body: any) {
    return this.svc.create(body);
  }
}
