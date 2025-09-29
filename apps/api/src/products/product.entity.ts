import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  VersionColumn,
} from 'typeorm';
import { decimalTransformer } from '../common/transformers/decimal.transformer';

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('products')
@Index(['nameLower'], { unique: true, where: `"deleted_at" IS NULL` })
@Index(['skuLower'],  { unique: true, where: `"deleted_at" IS NULL` })
@Index(['barcode'],   { unique: true, where: `"deleted_at" IS NULL AND "barcode" IS NOT NULL`,
})
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 120, select: false })
  nameLower: string; // unicidad case-insensitive

  @Column({ length: 32 })
  sku: string;

  @Column({ length: 32, select: false })
  skuLower: string;

  @Column({ type: 'varchar', length: 14, nullable: true })
  barcode: string | null; // dígitos normalizados (sin espacios/guiones)

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
price: number; // gracias al transformer lo usás como number en TS

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  category?: string;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @Column({ length: 140, nullable: true })
  slug?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;

  @VersionColumn()
  version: number;

  @Column({ length: 8, nullable: true })
  unit?: string; // UN / KG / LT, etc.

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, transformer: decimalTransformer })
  cost: number;

  // IVA con 1 decimal: 0, 10.5, 21, 27
  @Column({ type: 'decimal', precision: 4, scale: 1, default: 21, transformer: decimalTransformer })
  vat: number;
}
