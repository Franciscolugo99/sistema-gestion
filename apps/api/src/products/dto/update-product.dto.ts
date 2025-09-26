import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../product.entity';
import { IsEnum, IsOptional } from 'class-validator';

// 👇 PartialType hace que todos los campos de CreateProductDto sean opcionales
export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({ enum: ProductStatus, example: ProductStatus.ACTIVE })
  @IsOptional() @IsEnum(ProductStatus)
  status?: ProductStatus;
}
