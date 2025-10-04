// apps/api/src/products/dto/create-product.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsNumber, IsPositive, Min, MaxLength, Matches, IsEnum, IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ProductStatus } from '../product.entity';

// trims en strings
const trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
// deja solo dígitos en barcode
const onlyDigits = () => Transform(({ value }) => (typeof value === 'string' ? value.replace(/\D+/g, '') : value));

export class CreateProductDto {
  @ApiProperty()
  @IsString() @trim() @MaxLength(120)
  name!: string;

  @ApiProperty()
  @IsString() @trim() @Matches(/^[A-Za-z0-9_\-.]{3,32}$/, { message: 'SKU inválido (3-32, letras/números/_-. )' })
  sku!: string;

  @ApiPropertyOptional({ description: 'EAN-8 / UPC-A / EAN-13' })
  @IsOptional() @IsString() @onlyDigits()
  @Matches(/^(\d{8}|\d{12}|\d{13})$/, { message: 'Código de barras inválido (8, 12 o 13 dígitos)' })
  barcode?: string;

  @ApiPropertyOptional({ example: 'UN' })
  @IsOptional() @IsString() @trim() @MaxLength(8)
  unit: string = 'UN';

  @ApiPropertyOptional()
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  cost: number = 0;

  @ApiProperty()
  @Type(() => Number) @IsNumber() @IsPositive()
  price!: number;

  @ApiPropertyOptional({ description: '0 | 10.5 | 21 | 27' })
  @IsOptional() @Type(() => Number) @IsNumber()
  @IsIn([0, 10.5, 21, 27], { message: 'IVA inválido (0, 10.5, 21 o 27)' })
  vat: number = 21;

  // 👇 campos de stock que existen en la entidad
  @ApiPropertyOptional({ description: 'Stock inicial' })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  stockQty: number = 0;

  @ApiPropertyOptional({ description: 'Umbral para alerta de stock bajo' })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  minStock: number = 0;

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsOptional() @IsEnum(ProductStatus)
  status: ProductStatus = ProductStatus.ACTIVE;

  @ApiPropertyOptional({ example: 'Bebidas' })
  @IsOptional() @IsString() @MaxLength(40)
  category?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  description?: string;
}
