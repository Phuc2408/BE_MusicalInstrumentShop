import { ApiProperty } from "@nestjs/swagger";

export class MainImageDto {
    @ApiProperty({ example: 573 })
    id: number;

    @ApiProperty({ example: "https://example.com/image.jpg" })
    image_url: string;

    @ApiProperty({ example: true })
    is_main: boolean;

    @ApiProperty({ example: "2025-11-23T10:36:16.082Z" })
    created_at: string;
}

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

    @ApiProperty({ type: MainImageDto })
    main_image: MainImageDto | null;
}

export class CartItemResponseDto {
    @ApiProperty({ example: 123, description: "Product ID" })
    productId: number;

    @ApiProperty({ example: 2, description: "Quantity selected by user" })
    quantity: number;

    @ApiProperty({ type: ProductInCartDto })
    product: ProductInCartDto;
}

export class CartInnerDataDto {
    @ApiProperty({ type: [CartItemResponseDto] })
    cart_items: CartItemResponseDto[];
}

export class CartDataWrapperDto {
    @ApiProperty({ type: CartInnerDataDto })
    data: CartInnerDataDto;
}

// export class CartResponseDto {
//     @ApiProperty({
//         type: [CartItemResponseDto],
//         description: "List of items in the cart"
//     })
//     cart_items: CartItemResponseDto[];
// }