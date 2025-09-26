import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsPositive, Min, MaxLength, Matches, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ProductStatus } from '../product.entity';

const trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class CreateProductDto {
  @ApiProperty({ example: 'Café Molido 500g', description: 'Nombre visible del producto' })
  @IsString() @trim() @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'CAF-500', description: 'Código SKU único' })
  @IsString() @trim() @Matches(/^[A-Za-z0-9_\-\.]{3,32}$/, { message: 'SKU inválido' })
  sku: string;

  @ApiPropertyOptional({ example: '7791234567898', description: 'Código de barras EAN/UPC' })
  @IsOptional() @IsString() @MaxLength(14)
  barcode?: string;

  @ApiProperty({ example: 2899.9, description: 'Precio unitario (decimal con 2 dígitos)' })
  @IsNumber() @IsPositive()
  price: number;

  @ApiProperty({ example: 15, description: 'Stock disponible' })
  @IsNumber() @Min(0)
  stock: number;

  @ApiPropertyOptional({ example: 'Alimentos', description: 'Categoría del producto' })
  @IsOptional() @IsString() @MaxLength(40)
  category?: string;

  @ApiProperty({ enum: ProductStatus, example: ProductStatus.ACTIVE, description: 'Estado actual' })
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @ApiPropertyOptional({ example: 'Tueste medio, molienda fina.', description: 'Descripción larga' })
  @IsOptional() @IsString() @MaxLength(500)
  description?: string;
}

