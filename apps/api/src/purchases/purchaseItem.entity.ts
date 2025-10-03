import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Purchase } from './purchase.entity';
import { Product } from '../products/product.entity';

@Entity('purchase_items')
export class PurchaseItem {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Purchase, (p) => p.items, { onDelete: 'CASCADE' })
  purchase: Purchase;

  @ManyToOne(() => Product, { eager: true })
  product: Product;

  @Column({ type: 'int' })
  qty: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  cost: string;
}
