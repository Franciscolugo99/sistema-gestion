import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { Purchase } from './purchase.entity';
import { PurchaseItem } from './purchaseItem.entity';
import { Product } from '../products/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, PurchaseItem, Product])],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule {}
