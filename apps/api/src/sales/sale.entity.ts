import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SaleItem } from './saleItem.entity';
import { Payment } from './payment.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid') id: string;
  @CreateDateColumn() datetime: Date;
  @Column({ type: 'numeric', precision: 12, scale: 2 }) subtotal: string;
  @Column({ type: 'numeric', precision: 12, scale: 2 }) total: string;

  @OneToMany(() => SaleItem, (i) => i.sale) items: SaleItem[];
  @OneToMany(() => Payment,  (p) => p.sale) payments: Payment[];
}
