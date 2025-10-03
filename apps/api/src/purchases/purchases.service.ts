import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { Purchase } from './purchase.entity';
import { PurchaseItem } from './purchaseItem.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class PurchasesService {
  constructor(private ds: DataSource) {}

  async create(body: { items: { productId: string; qty: number; cost?: number }[] }) {
    const { items = [] } = body || {};
    if (!items.length) throw new BadRequestException('Sin items');

    return this.ds.transaction(async (trx) => {
      const prodRepo = trx.getRepository(Product);
      const purRepo  = trx.getRepository(Purchase);
      const itemRepo = trx.getRepository(PurchaseItem);

      const ids = items.map(i => i.productId);
      const prods = await prodRepo.find({ where: { id: In(ids) } });
      const byId = new Map(prods.map(p => [p.id, p]));

      let total = 0;
      const purchase = await purRepo.save(purRepo.create({ total: 0 }));

      for (const i of items) {
        const p = byId.get(i.productId);
        if (!p) throw new BadRequestException(`Producto no existe: ${i.productId}`);

        total += (i.cost ?? p.cost ?? 0) * i.qty;

        await itemRepo.save(itemRepo.create({
          purchase,
          product: { id: i.productId } as any,
          qty: i.qty,
          cost: i.cost ?? p.cost ?? 0,
        }));

        // actualiza costo si se pasa
        if (i.cost !== undefined) {
          p.cost = i.cost;
        }

        // suma stock
        await prodRepo
          .createQueryBuilder()
          .update(Product)
          .set({ stockQty: () => `"stockQty" + ${i.qty}`, cost: p.cost })
          .where("id = :id", { id: i.productId })
          .execute();
      }

      purchase.total = total.toString();
      await purRepo.save(purchase);

      return { purchaseId: purchase.id, total };
    });
  }
}
