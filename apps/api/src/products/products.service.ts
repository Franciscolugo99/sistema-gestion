import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Not, Repository } from 'typeorm';
import { Product, ProductStatus } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { assertUniqueProductFields } from './validators/unique-field.validator';
import { isValidBarcode, normalizeBarcode } from './validators/barcode.validator';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  private normalize(p: Partial<Product>) {
    if (p.name) p.nameLower = p.name.trim().toLowerCase();
    if (p.sku)  p.skuLower  = p.sku.trim().toLowerCase();
    if (p.barcode !== undefined) p.barcode = normalizeBarcode(p.barcode);
    if (p.slug === undefined && p.name) {
      p.slug = p.name.trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 140);
    }
    return p;
  }
  async lowStock(limit = 50) {
    const items = await this.repo
      .createQueryBuilder('p')
      .where('p.deletedAt IS NULL') // quita esto si NO usas soft delete
      .andWhere('p.stockQty <= p.minStock')
      .andWhere('p.stockQty >= 0')
      .orderBy('p.stockQty', 'ASC')
      .take(Math.min(limit, 200))
      .getMany();
    return { items, total: items.length };
  }
  async create(dto: CreateProductDto) {
    if (!isValidBarcode(dto.barcode)) throw new BadRequestException('Código de barras inválido (EAN-8/EAN-13/UPC-A).');

    const toSave = this.normalize({ ...dto });
    await assertUniqueProductFields(this.repo, {
      name: toSave.name, sku: toSave.sku, barcode: toSave.barcode ?? null
    });

    const entity = this.repo.create(toSave);
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!product) throw new NotFoundException('Producto no encontrado.');

    const partial = this.normalize({ ...dto });

    if (partial.barcode !== undefined && !isValidBarcode(partial.barcode)) {
      throw new BadRequestException('Código de barras inválido (EAN-8/EAN-13/UPC-A).');
    }

    await assertUniqueProductFields(
      this.repo,
      {
        name: partial.name ?? product.name,
        sku: partial.sku ?? product.sku,
        barcode: partial.barcode ?? product.barcode ?? null,
      },
      id
    );

    Object.assign(product, partial);
    return this.repo.save(product); // respeta @VersionColumn
  }

  async softDelete(id: string) {
    const product = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!product) throw new NotFoundException('Producto no encontrado.');
    await this.repo.softRemove(product);
    return { ok: true };
  }

  async restore(id: string) {
    await this.repo.restore(id);
    return { ok: true };
  }

  async findById(id: string) {
    const p = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!p) throw new NotFoundException('Producto no encontrado.');
    return p;
  }

  // Paginado + búsqueda simple
  async search(params: { q?: string; page?: number; limit?: number; status?: ProductStatus | 'ALL' }) {
    const { q, page = 1, limit = 20, status = 'ALL' } = params;
    const where: any = { deletedAt: IsNull() };
    if (q) {
      // ILike hace búsqueda case-insensitive en PG
      where.name = ILike(`%${q}%`);
    }
    if (status !== 'ALL') where.status = status;

    const [items, total] = await this.repo.findAndCount({
      where,
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: Math.min(limit, 100),
    });

    return {
      items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
  }
}
