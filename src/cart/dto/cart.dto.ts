import { IsInt, IsNotEmpty, Min } from "class-validator";

export class AddToCartDto {
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @IsInt()
  @Min(1)
  quantity: number;
}