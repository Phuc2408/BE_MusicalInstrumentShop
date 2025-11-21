import { IsInt, IsNotEmpty, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AddToCartDto {
  @ApiProperty({
    description: "Unique identifier of the product to add to the cart.",
    example: 123,
  })
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @ApiProperty({
    description: "Number of units of the product to add to the cart. Must be at least 1.",
    example: 2,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @ApiProperty({
    description: "Updated quantity for the existing cart item. Must be at least 1.",
    example: 3,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}