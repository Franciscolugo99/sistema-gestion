import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { Sale } from './sale.entity';
import { SaleItem } from './saleItem.entity';
import { Payment } from './payment.entity';
import { Product } from '../products/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleItem, Payment, Product])],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
