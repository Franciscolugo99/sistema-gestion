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

      // 1) crear compra SIN encadenar save(create(...))
      const purchase = purRepo.create({ total: '0' });
      await purRepo.save(purchase);

      let total = 0;

      for (const i of items) {
        const p = byId.get(i.productId);
        if (!p) throw new BadRequestException(`Producto no existe: ${i.productId}`);

        // si no mandan cost, uso el cost del producto; p.cost puede ser number -> normalizo a number
        const unitCost = i.cost ?? Number(p.cost ?? 0);
        total += unitCost * i.qty;

        // 2) guardar item (cost como string por ser numeric)
        const item = itemRepo.create({
          purchase,
          product: { id: i.productId } as any,
          qty: i.qty,
          cost: String(unitCost),
        });
        await itemRepo.save(item);

        // 3) si pasaron cost, actualizo el costo en el producto
        const patch: Partial<Product> = i.cost !== undefined ? { cost: i.cost } : {};
await prodRepo
  .createQueryBuilder()
  .update(Product)
  .set({ stockQty: () => `"stock" + ${i.qty}`, ...patch }) // 👈 columna real
  .where('id = :id', { id: i.productId })
  .execute();

      // 4) actualizar total (string)
      purchase.total = String(total);
      await purRepo.save(purchase);

      return { purchaseId: purchase.id, total };
    });
  }
}
