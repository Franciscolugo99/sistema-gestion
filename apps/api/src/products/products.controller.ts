import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductStatus } from './product.entity';

@ApiTags('products')                // ← agrupa en la sección "products" en /docs
@Controller('products')
export class ProductsController {
  constructor(private readonly svc: ProductsService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Producto creado' })
  create(@Body() dto: CreateProductDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiResponse({ status: 200, description: 'Producto actualizado' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiResponse({ status: 200, description: 'Producto eliminado (soft delete)' })
  remove(@Param('id') id: string) {
    return this.svc.softDelete(id);
  }

  @Post(':id/restore')
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiResponse({ status: 200, description: 'Producto restaurado' })
  restore(@Param('id') id: string) {
    return this.svc.restore(id);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiResponse({ status: 200, description: 'Detalle del producto' })
  get(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Get()
  @ApiQuery({ name: 'q', required: false, description: 'Búsqueda por texto' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'status', required: false, enum: ['ALL', ...Object.values(ProductStatus)] })
  @ApiResponse({ status: 200, description: 'Listado paginado' })
  list(
    @Query('q') q?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status: ProductStatus | 'ALL' = 'ALL',
  ) {
    return this.svc.search({ q, page: Number(page), limit: Number(limit), status });
  }
}
