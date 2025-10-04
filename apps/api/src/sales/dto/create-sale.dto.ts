// src/sales/dto/create-sale.dto.ts
import { IsArray, IsIn, IsNumber, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SaleItemDto {
  @IsUUID() productId!: string;
  @IsNumber() @Min(1) qty!: number;
  @IsNumber() price!: number;
  @IsNumber() vat!: number;
}

class PaymentDto {
  @IsIn(['cash','debit','credit','transfer']) method!: 'cash'|'debit'|'credit'|'transfer';
  @IsNumber() amount!: number;
}

export class CreateSaleDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => SaleItemDto)
  items!: SaleItemDto[];

  @IsArray() @ValidateNested({ each: true }) @Type(() => PaymentDto)
  payments!: PaymentDto[];
}
