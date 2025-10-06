import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { Sale } from './sale.entity';
import { decimalTransformer } from '../common/transformers/decimal.transformer';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Sale, (s) => s.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sale_id' })           // 👈 nombre real en DB
  sale: Sale;

  @Column({ type: 'varchar', length: 16 })
  method: 'cash' | 'debit' | 'credit' | 'transfer';

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  amount: number;
}
