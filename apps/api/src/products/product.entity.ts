import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  sku?: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  barcode?: string;

  @Column({ default: 'UN' })
  unit: string;

  @Column('numeric', { precision: 14, scale: 2, default: 0 })
  cost: number;

  @Column('numeric', { precision: 14, scale: 2, default: 0 })
  price: number;

  @Column('numeric', { precision: 5, scale: 2, default: 21 })
  vat: number;

  @Column({ default: true })
  is_active: boolean;
}
