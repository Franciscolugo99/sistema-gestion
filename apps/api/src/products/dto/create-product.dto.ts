import {
  IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min,
} from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  sku?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  barcode?: string;

  @IsString()
  @IsIn(['UN','KG','LT'], { message: 'Unidad inválida' })
  unit: string = 'UN';

  @IsNumber()
  @Min(0, { message: 'El costo no puede ser negativo' })
  cost: number = 0;

  @IsNumber()
  @Min(0.01, { message: 'El precio debe ser mayor a 0' })
  price: number = 0;

  @IsNumber()
  @IsIn([0, 10.5, 21, 27] as any, { message: 'IVA inválido' })
  vat: number = 21;
}
