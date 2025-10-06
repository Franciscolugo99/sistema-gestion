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

      const ids = items.map((i) => i.productId);
      const prods = await prodRepo.find({ where: { id: In(ids) } });
      const byId = new Map(prods.map((p) => [p.id, p]));

      // crear compra (sin encadenar save(create(...)))
      const purchase = purRepo.create({ total: '0' });
      await purRepo.save(purchase);

      let total = 0;

      for (const i of items) {
        const p = byId.get(i.productId);
        if (!p) throw new BadRequestException(`Producto no existe: ${i.productId}`);

        const unitCost = i.cost ?? Number(p.cost ?? 0);
        total += unitCost * i.qty;

        const item = itemRepo.create({
          purchase,
          product: { id: i.productId } as any,
          qty: i.qty,
          cost: String(unitCost), // numeric -> string
        });
        await itemRepo.save(item);

        const patch: Partial<Product> = i.cost !== undefined ? { cost: i.cost } : {};

        await prodRepo
          .createQueryBuilder()
          .update(Product)
          // importante: usar nombre de columna real "stock" en la expresión
          .set({ stockQty: () => `"stock" + ${i.qty}`, ...patch })
          .where('id = :id', { id: i.productId })
          .execute();
      }

      purchase.total = String(total);
      await purRepo.save(purchase);

      return { purchaseId: purchase.id, total };
    }); // ← cierra transaction correctamente
  }
}
