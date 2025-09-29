import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsNumber, IsPositive, Min, MaxLength, Matches, IsEnum, IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ProductStatus } from '../product.entity';

const trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class CreateProductDto {
  @ApiProperty() @IsString() @trim() @MaxLength(120)
  name!: string;

  @ApiProperty() @IsString() @trim() @Matches(/^[A-Za-z0-9_\-\.]{3,32}$/)
  sku!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(14)
  barcode?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(8) @trim()
  unit?: string = 'UN';

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  cost?: number = 0;

  @ApiProperty() @Type(() => Number) @IsNumber() @IsPositive()
  price!: number;

  @ApiPropertyOptional({ description: '0 | 10.5 | 21 | 27' })
  @IsOptional() @Type(() => Number) @IsNumber()
  @IsIn([0, 10.5, 21, 27], { message: 'IVA inválido (0, 10.5, 21 o 27)' })
  vat?: number = 21;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  stock?: number = 0;

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsOptional() @IsEnum(ProductStatus)
  status?: ProductStatus = ProductStatus.ACTIVE;

  // 👇 volver a incluir category
  @ApiPropertyOptional({ example: 'Bebidas' })
  @IsOptional() @IsString() @MaxLength(40)
  category?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  description?: string;
}
