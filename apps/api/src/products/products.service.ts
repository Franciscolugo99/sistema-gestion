import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Repository } from 'typeorm';
import { Product, ProductStatus } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { assertUniqueProductFields } from './validators/unique-field.validator';
import { isValidBarcode, normalizeBarcode } from './validators/barcode.validator';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  /** Normaliza campos de texto y slug */
  private normalize(p: Partial<Product>) {
    if (p.name) p.nameLower = p.name.trim().toLowerCase();
    if (p.sku) p.skuLower = p.sku.trim().toLowerCase();
    if (p.barcode !== undefined) p.barcode = normalizeBarcode(p.barcode);
    if (p.slug === undefined && p.name) {
      p.slug = p.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 140);
    }
    return p;
  }

  /** Lista de productos con stock bajo */
  async lowStock(limit = 50) {
    const qb = this.repo
      .createQueryBuilder('p')
      .where('p.deleted_at IS NULL')
      .andWhere(`p."stock" <= p."minstock"`)
      .andWhere(`p."stock" >= 0`)
      .orderBy(`p."stock"`, 'ASC')
      .take(Math.min(limit, 200));

    const items = await qb.getMany();
    return { items, total: items.length };
  }

  /** Crea un producto nuevo */
  async create(dto: CreateProductDto) {
    if (dto.barcode && !isValidBarcode(dto.barcode)) {
      throw new BadRequestException('Código de barras inválido (EAN-8/EAN-13/UPC-A).');
    }

    // Normaliza texto
    const toSave = this.normalize({ ...dto });

    // Valida unicidad
    await assertUniqueProductFields(this.repo, {
      name: toSave.name,
      sku: toSave.sku,
      barcode: toSave.barcode ?? null,
    });

    // Mapea DTO → entidad
    const entity = this.repo.create({
      name: toSave.name,
      sku: toSave.sku,
      barcode: toSave.barcode ?? null,
      unit: toSave.unit ?? 'UN',
      cost: toSave.cost ?? 0,
      price: toSave.price,
      vat: toSave.vat ?? 21,
      status: toSave.status ?? ProductStatus.ACTIVE,
      category: toSave.category ?? null,
      description: toSave.description ?? null,
      stockQty: dto.stock ?? 0,   // 👈 nuevo
      minStock: dto.minStock ?? 0 // 👈 nuevo
    });

    return this.repo.save(entity);
  }

  /** Actualiza un producto existente */
  async update(id: string, dto: UpdateProductDto) {
    const product = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!product) throw new NotFoundException('Producto no encontrado.');

    const partial = this.normalize({ ...dto });

    if (partial.barcode !== undefined && !isValidBarcode(partial.barcode)) {
      throw new BadRequestException('Código de barras inválido (EAN-8/EAN-13/UPC-A).');
    }

    // Valida unicidad
    await assertUniqueProductFields(
      this.repo,
      {
        name: partial.name ?? product.name,
        sku: partial.sku ?? product.sku,
        barcode: partial.barcode ?? product.barcode ?? null,
      },
      id
    );

    // Mapeo DTO → entidad
    if (dto.stock !== undefined) product.stockQty = dto.stock;
    if (dto.minStock !== undefined) product.minStock = dto.minStock;

    Object.assign(product, partial);

    return this.repo.save(product); // respeta @VersionColumn
  }

  /** Eliminación lógica */
  async softDelete(id: string) {
    const product = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!product) throw new NotFoundException('Producto no encontrado.');
    await this.repo.softRemove(product);
    return { ok: true };
  }

  /** Restaurar */
  async restore(id: string) {
    await this.repo.restore(id);
    return { ok: true };
  }

  /** Buscar por ID */
  async findById(id: string) {
    const p = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!p) throw new NotFoundException('Producto no encontrado.');
    return p;
  }

  /** Búsqueda paginada */
  async search(params: { q?: string; page?: number; limit?: number; status?: ProductStatus | 'ALL' }) {
    const { q, page = 1, limit = 20, status = 'ALL' } = params;
    const where: any = { deletedAt: IsNull() };

    if (q) where.name = ILike(`%${q}%`);
    if (status !== 'ALL') where.status = status;

    const [items, total] = await this.repo.findAndCount({
      where,
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: Math.min(limit, 100),
    });

    return { items, page, limit, total, pages: Math.ceil(total / limit) };
  }
}
