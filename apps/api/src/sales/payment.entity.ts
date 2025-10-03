import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Sale } from './sale.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Sale, (s) => s.payments, { onDelete: 'CASCADE' }) sale: Sale;
  @Column() method: string; // 'cash' | 'debit' | 'credit' | 'transfer'
  @Column({ type: 'numeric', precision: 12, scale: 2 }) amount: string;
}
