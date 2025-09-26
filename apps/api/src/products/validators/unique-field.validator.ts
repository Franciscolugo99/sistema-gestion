import { BadRequestException } from '@nestjs/common';
import { Repository, Not, IsNull } from 'typeorm';
import { Product } from '../product.entity';

export async function assertUniqueProductFields(
  repo: Repository<Product>,
  { name, sku, barcode }: { name?: string; sku?: string; barcode?: string | null },
  currentId?: string
) {
  const nameLower = name?.trim().toLowerCase();
  const skuLower  = sku?.trim().toLowerCase();
  const barcodeNorm = barcode ?? null;

  if (nameLower) {
    const exists = await repo.findOne({ where: { nameLower, deletedAt: IsNull(), ...(currentId ? { id: Not(currentId) } : {}) } });
    if (exists) throw new BadRequestException('Ya existe un producto con ese nombre.');
  }
  if (skuLower) {
    const exists = await repo.findOne({ where: { skuLower, deletedAt: IsNull(), ...(currentId ? { id: Not(currentId) } : {}) } });
    if (exists) throw new BadRequestException('Ya existe un producto con ese SKU.');
  }
  if (barcodeNorm) {
    const exists = await repo.findOne({ where: { barcode: barcodeNorm, deletedAt: IsNull(), ...(currentId ? { id: Not(currentId) } : {}) } });
    if (exists) throw new BadRequestException('Ya existe un producto con ese código de barras.');
  }
}
