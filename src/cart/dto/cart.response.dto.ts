import { ApiProperty } from "@nestjs/swagger";

export class ProductInCartDto {
    @ApiProperty({ example: 123 })
    id: number;

    @ApiProperty({ example: "Yamaha Piano U1" })
    product_name: string;

    @ApiProperty({ example: "yamaha-piano-u1" })
    slug: string;

    @ApiProperty({ example: "150,000,000đ", description: "Formatted display price" })
    price_display: string;

    @ApiProperty({ example: 150000000, description: "Numeric price for calculations" })
    price_numeric: number;

    @ApiProperty({ example: 10 })
    stock_quantity: number;

    @ApiProperty({
        example: { url: "https://example.com/image.jpg", is_main: true },
        nullable: true
    })
    main_image: any;
}

export class CartItemResponseDto {
    @ApiProperty({ example: 123, description: "Product ID" })
    productId: number;

    @ApiProperty({ example: 2, description: "Quantity selected by user" })
    quantity: number;

    @ApiProperty({ type: ProductInCartDto })
    product: ProductInCartDto;
}

export class CartResponseDto {
    @ApiProperty({
        type: [CartItemResponseDto],
        description: "List of items in the cart"
    })
    cart_items: CartItemResponseDto[];
}