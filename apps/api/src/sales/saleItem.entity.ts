// src/sales/saleItem.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from '../products/product.entity';

@Entity('sale_items')
export class SaleItem {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @ManyToOne(() => Sale, (s) => s.items, { onDelete: 'CASCADE' })
  sale!: Sale;

  @ManyToOne(() => Product, { eager: true })
  product!: Product;

  @Column({ type: 'int' }) qty!: number;
  @Column({ type: 'numeric', precision: 12, scale: 2 }) price!: string; // numeric -> string
  @Column({ type: 'numeric', precision: 12, scale: 2 }) vat!: string;   // numeric -> string
}
