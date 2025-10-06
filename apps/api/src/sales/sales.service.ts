import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { Sale } from './sale.entity';
import { SaleItem } from './saleItem.entity';
import { Payment } from './payment.entity';
import { Product } from '../products/product.entity';

type PaymentMethod = 'cash' | 'debit' | 'credit' | 'transfer';

interface CreateSaleBody {
  items: { productId: string; qty: number }[];
  payments: { method: PaymentMethod; amount: number }[];
}

@Injectable()
export class SalesService {
  constructor(private ds: DataSource) {}

  async create(body: CreateSaleBody) {
    const { items = [], payments = [] } = body || {};
    if (!items.length) throw new BadRequestException('La venta no tiene ítems.');
    if (!payments.length) throw new BadRequestException('Debe indicar al menos un pago.');

    return this.ds.transaction(async (trx) => {
      const prodRepo = trx.getRepository(Product);
      const saleRepo = trx.getRepository(Sale);
      const itemRepo = trx.getRepository(SaleItem);
      const payRepo  = trx.getRepository(Payment);

      // Traemos productos
      const ids = items.map(i => i.productId);
      const prods = await prodRepo.find({ where: { id: In(ids) } });
      const byId = new Map(prods.map(p => [p.id, p]));

      // Calculamos totales y validamos stock
      let subtotal = 0;
      const prepared = items.map(i => {
        const p = byId.get(i.productId);
        if (!p) throw new BadRequestException(`Producto inexistente: ${i.productId}`);

        // ⚠️ usamos 'as any' para evitar choque de tipos si TS no ve 'stock'
        const currentStock = Number((p as any).stock ?? 0);
        if (currentStock < i.qty) {
          throw new BadRequestException(`Stock insuficiente de ${p.name} (hay ${currentStock})`);
        }

        const price = Number((p as any).price ?? 0);
        const vat   = Number((p as any).vat ?? 0);
        const line  = price * i.qty;
        subtotal += line;
        return { p, qty: i.qty, price, vat };
      });

      const total = subtotal;

      // Guardamos cabecera (usa numbers)
      const sale = await saleRepo.save(
        saleRepo.create({
          subtotal,
          total,
        }),
      );

      // Ítems + descuento de stock
      for (const row of prepared) {
        // ⚠️ casteo a any para evitar choque de DeepPartial con relaciones
        await itemRepo.save(
          itemRepo.create({
            sale,
            product: { id: row.p.id } as any,
            qty: row.qty,
            price: row.price,
            vat: row.vat,
          } as any),
        );

        // ⚠️ actualizar stock con SQL crudo (evita typing de .set())
        await trx.query(
          'UPDATE products SET "stock" = "stock" - $1 WHERE id = $2',
          [row.qty, row.p.id],
        );
      }

      // Pagos (number, no string)
      let paid = 0;
      for (const p of payments) {
        const amount = Number(p.amount ?? 0);
        if (amount <= 0) continue;
        paid += amount;
        await payRepo.save(
          payRepo.create({
            sale,
            method: p.method,
            amount,
          } as any),
        );
      }

      if (Math.round(paid * 100) !== Math.round(total * 100)) {
        throw new BadRequestException(
          `Los pagos ($${paid.toFixed(2)}) no coinciden con el total ($${total.toFixed(2)}).`,
        );
      }

      return { saleId: sale.id, total };
    });
  }
}
