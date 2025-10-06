import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SaleItem } from './saleItem.entity';
import { Payment } from './payment.entity';
import { decimalTransformer } from '../common/transformers/decimal.transformer';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  datetime: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  total: number;

  @OneToMany(() => SaleItem, (i) => i.sale)
  items: SaleItem[];

  @OneToMany(() => Payment, (p) => p.sale)
  payments: Payment[];
}
