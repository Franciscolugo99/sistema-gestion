import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  // --- CREATE con reglas de negocio (duplicados) ---
  async create(data: Partial<Product>) {
    // Normalización simple
    if (typeof data.sku === 'string') data.sku = data.sku.trim();
    if (typeof data.name === 'string') data.name = data.name.trim();

    // Validar duplicados
    if (data.sku) {
      const existsSku = await this.repo.findOne({ where: { sku: data.sku } });
      if (existsSku) {
        throw new BadRequestException('Ya existe un producto con ese SKU');
      }
    }
    if (data.name) {
      const existsName = await this.repo.findOne({ where: { name: data.name } });
      if (existsName) {
        throw new BadRequestException('Ya existe un producto con ese nombre');
      }
    }

    const product = this.repo.create(data);

    try {
      return await this.repo.save(product);
    } catch (e: any) {
      if (e?.code === '23505') {
        throw new BadRequestException('El SKU o el nombre ya existen');
      }
      throw e;
    }
  }

  // --- UPDATE con reglas de negocio (duplicados) ---
  async update(id: string, dto: UpdateProductDto) {
    const current = await this.repo.findOne({ where: { id } });
    if (!current) throw new NotFoundException('Producto no encontrado');

    // Normalización
    if (typeof dto.sku === 'string') dto.sku = dto.sku.trim();
    if (typeof dto.name === 'string') dto.name = dto.name.trim();

    if (dto.sku && dto.sku !== current.sku) {
      const existsSku = await this.repo.findOne({ where: { sku: dto.sku } });
      if (existsSku) {
        throw new BadRequestException('Ya existe un producto con ese SKU');
      }
    }
    if (dto.name && dto.name !== current.name) {
      const existsName = await this.repo.findOne({ where: { name: dto.name } });
      if (existsName) {
        throw new BadRequestException('Ya existe un producto con ese nombre');
      }
    }

    Object.assign(current, dto);

    try {
      return await this.repo.save(current);
    } catch (e: any) {
      if (e?.code === '23505') {
        throw new BadRequestException('El SKU o el nombre ya existen');
      }
      throw e;
    }
  }

  async remove(id: string) {
    const current = await this.repo.findOne({ where: { id } });
    if (!current) throw new NotFoundException('Producto no encontrado');
    await this.repo.remove(current);
    return { ok: true };
  }
}
