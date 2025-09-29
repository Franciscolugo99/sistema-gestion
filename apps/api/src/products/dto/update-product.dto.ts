import { PartialType } from '@nestjs/mapped-types'; // 👈 cambio acá
import { CreateProductDto } from './create-product.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../product.entity';
import { IsEnum, IsOptional } from 'class-validator';

// Todos los campos de Create se vuelven opcionales para Update
export class UpdateProductDto extends PartialType(CreateProductDto) {
  // (Opcional) lo dejamos para que Swagger muestre bien el enum
  @ApiPropertyOptional({ enum: ProductStatus, example: ProductStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
