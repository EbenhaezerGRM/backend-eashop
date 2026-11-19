import { IsInt, Min } from 'class-validator';

export class GetSellerPromosDto {
  @IsInt()
  @Min(1)
  sellerId!: number;
}