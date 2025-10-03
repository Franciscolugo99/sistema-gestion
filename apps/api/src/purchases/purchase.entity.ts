import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PurchaseItem } from './purchaseItem.entity';

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn('uuid') id: string;

  @CreateDateColumn()
  datetime: Date;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total: string;

  @OneToMany(() => PurchaseItem, (i) => i.purchase, { cascade: true })
  items: PurchaseItem[];
}