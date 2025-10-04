// src/sales/sales.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { Product } from '../products/product.entity';
import { Sale } from './sale.entity';
import { SaleItem } from './saleItem.entity';
import { Payment } from './payment.entity';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private ds: DataSource) {}

  async create(dto: CreateSaleDto) {
    const { items = [], payments = [] } = dto || {};
    if (!items.length) throw new BadRequestException('Sin items');

    return this.ds.transaction(async (trx) => {
      const prodRepo = trx.getRepository(Product);
      const saleRepo = trx.getRepository(Sale);
      const itemRepo = trx.getRepository(SaleItem);
      const payRepo  = trx.getRepository(Payment);

      const ids = items.map(i => i.productId);
      const prods = await prodRepo.find({ where: { id: In(ids) } });
      const byId = new Map(prods.map(p => [p.id, p]));

      // validar stock
      for (const i of items) {
        const p = byId.get(i.productId);
        if (!p) throw new BadRequestException(`Producto no existe: ${i.productId}`);
        const current = (p as any).stockQty ?? 0;
        if (current < i.qty) throw new BadRequestException(`Stock insuficiente de ${p.name} (hay ${current})`);
      }

      const totalNum = items.reduce((a, i) => a + i.price * i.qty, 0);
      const paidNum  = payments.reduce((a, p) => a + Number(p.amount || 0), 0);
      if (Math.round(paidNum * 100) !== Math.round(totalNum * 100))
        throw new BadRequestException(`Importe pagado ${paidNum} != total ${totalNum}`);

      // ❗️ NO encadenar save(create(...))
      const sale = saleRepo.create({ subtotal: String(totalNum), total: String(totalNum) });
      await saleRepo.save(sale);

      for (const i of items) {
        const si = itemRepo.create({
          sale,
          product: { id: i.productId } as any,
          qty: i.qty,
          price: String(i.price),
          vat: String(i.vat),
        });
        await itemRepo.save(si);

await prodRepo
  .createQueryBuilder()
  .update(Product)
  .set({ stockQty: () => `"stock" - ${i.qty}` }) // 👈 columna real
  .where('id = :id', { id: i.productId })
  .execute();

      for (const p of payments) {
        const pay = payRepo.create({ sale, method: p.method, amount: String(p.amount) });
        await payRepo.save(pay);
      }

      return { saleId: sale.id, total: totalNum };
    });
  }
}
