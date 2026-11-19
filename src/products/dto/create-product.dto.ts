import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsPositive,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsPositive()
  price: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsInt()
  @Min(0)
  stock: number;
}
