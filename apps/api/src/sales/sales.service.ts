import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { Product } from '../products/product.entity';
import { Sale } from './sale.entity';
import { SaleItem } from './saleItem.entity';
import { Payment } from './payment.entity';

@Injectable()
export class SalesService {
  constructor(private ds: DataSource) {}

  // versión simple (transaccional) – descuenta stock
  async create(body: { items: { productId: string; qty: number; price: number; vat: number }[]; payments: { method: string; amount: number }[]; }) {
    const { items = [], payments = [] } = body || {};
    if (!items.length) throw new BadRequestException('Sin items');

    return this.ds.transaction(async (trx) => {
      const prodRepo = trx.getRepository(Product);
      const saleRepo = trx.getRepository(Sale);
      const itemRepo = trx.getRepository(SaleItem);
      const payRepo  = trx.getRepository(Payment);

      const ids = items.map(i => i.productId);
      const prods = await prodRepo.find({ where: { id: In(ids) } });
      const byId = new Map(prods.map(p => [p.id, p]));

      for (const i of items) {
        const p = byId.get(i.productId);
        if (!p) throw new BadRequestException(`Producto no existe: ${i.productId}`);
        if ((p as any).stockQty !== undefined && p['stockQty'] < i.qty)
          throw new BadRequestException(`Stock insuficiente de ${p.name}`);
      }

      const total = items.reduce((a, i) => a + i.price * i.qty, 0);
      const pagado = payments.reduce((a, p) => a + Number(p.amount || 0), 0);
      if (Math.round(pagado * 100) !== Math.round(total * 100))
        throw new BadRequestException(`Importe pagado ${pagado} != total ${total}`);

      const sale = await saleRepo.save(saleRepo.create({ subtotal: total, total }));

      for (const i of items) {
        await itemRepo.save(itemRepo.create({
          sale,
          product: { id: i.productId } as any,
          qty: i.qty,
          price: i.price,
          vat: i.vat,
        }));
        // descuenta stock si existe el campo
        await prodRepo
          .createQueryBuilder()
          .update(Product)
          .set({ stockQty: () => `"stockQty" - ${i.qty}` })
          .where("id = :id", { id: i.productId })
          .execute();
      }

      for (const p of payments) {
        await payRepo.save(payRepo.create({ sale, method: p.method as any, amount: p.amount as any }));
      }

      return { saleId: sale.id, total };
    });
  }
}
