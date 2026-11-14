
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateSellerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  storeName: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
