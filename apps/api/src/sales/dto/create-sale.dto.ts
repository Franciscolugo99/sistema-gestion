// apps/api/src/sales/dto/create-sale.dto.ts
import { IsArray, IsIn, IsNumber, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SaleItemDto {
  @IsUUID() productId: string;
  @IsNumber() @Min(1) qty: number;
  @IsNumber() price: number;
  @IsNumber() vat: number; // % (ej 21)
}

class PaymentDto {
  @IsIn(['cash','debit','credit','transfer']) method: 'cash'|'debit'|'credit'|'transfer';
  @IsNumber() amount: number;
}

export class CreateSaleDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => SaleItemDto) items: SaleItemDto[];
  @IsArray() @ValidateNested({ each: true }) @Type(() => PaymentDto) payments: PaymentDto[];
}

// apps/api/src/sales/sales.controller.ts
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Controller('sales')
export class SalesController {
  constructor(private svc: SalesService) {}
  @Post() create(@Body() dto: CreateSaleDto) { return this.svc.create(dto); }
  @Get('low-stock') lowStock(@Query('limit') limit = '50') {
    return this.svc.lowStock(Number(limit));
  }
}
