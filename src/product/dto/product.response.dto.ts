import { ApiProperty } from '@nestjs/swagger';

// ==========================================
// 1. SUB-DTOs (Các thành phần con dùng chung)
// ==========================================

export class BrandResponse {
    @ApiProperty({ example: 10 }) id: number;
    @ApiProperty({ example: 'Fender' }) name: string;
    @ApiProperty({ example: 'fender' }) slug: string;
    @ApiProperty({ example: null, nullable: true }) description: string | null;
    @ApiProperty({ example: '2025-11-23T03:36:16.082Z' }) created_at: Date;
    @ApiProperty({ example: '2025-11-23T03:36:16.082Z' }) updated_at: Date;
}

export class CategoryResponse {
    @ApiProperty({ example: 6 }) id: number;
    @ApiProperty({ example: 'Acoustic Guitars' }) name: string;
    @ApiProperty({ example: 'acoustic-guitars' }) slug: string;
    @ApiProperty({ example: 5, nullable: true }) parent_id: number | null;
    @ApiProperty({ example: '2025-11-23T03:36:16.082Z' }) created_at: Date;
    @ApiProperty({ example: '2025-11-23T03:36:16.082Z' }) updated_at: Date;
}

export class ProductImageResponse {
    @ApiProperty({ example: 6116 }) id: number;
    @ApiProperty({ example: 'https://www.sweelee.com.vn/cdn/shop/files/product.jpg' }) image_url: string;
    @ApiProperty({ example: true }) is_main: boolean;
    @ApiProperty({ example: '2025-11-23T03:36:16.082Z' }) created_at: Date;
}

// ==========================================
// 2. PRODUCT ITEMS (Khai báo riêng biệt)
// ==========================================

/**
 * DTO dùng cho các danh sách (Brand List, Category List).
 * KHÔNG CÓ trường Category.
 */
export class ProductListItemResponse {
    @ApiProperty({ example: 1109 }) id: number;

    @ApiProperty({ type: () => BrandResponse })
    brand: BrandResponse;

    // ❌ Đã xóa category hoàn toàn

    @ApiProperty({ type: () => [ProductImageResponse] })
    images: ProductImageResponse[];

    @ApiProperty({ example: 'Congress CST150 LR HSS Electric Guitar' }) product_name: string;
    @ApiProperty({ example: 'congress-cst150-lr-hss' }) slug: string;
    @ApiProperty({ example: '3.750.000₫', nullable: true }) price_display: string | null;
    @ApiProperty({ example: 'Modern tone...' }) description: string;
    @ApiProperty({ example: '3750000.00' }) price_numeric: string;
    @ApiProperty({ example: 3 }) stock_quantity: number;

    @ApiProperty({
        example: { "Bridge": "Tremolo", "Pickups": "HSS" },
        nullable: true
    })
    specifications: Record<string, any> | null;

    @ApiProperty({ example: '2025-11-23T03:36:16.082Z' }) created_at: Date;
    @ApiProperty({ example: '2025-11-23T03:36:16.082Z' }) updated_at: Date;
}

/**
 * DTO dùng cho Chi tiết sản phẩm (Detail).
 * CÓ trường Category, nằm ngay dưới Brand.
 */
export class ProductDetailResponse {
    @ApiProperty({ example: 221 }) id: number;

    @ApiProperty({ type: () => BrandResponse })
    brand: BrandResponse;

    @ApiProperty({ type: () => CategoryResponse })
    category: CategoryResponse;

    @ApiProperty({ type: () => [ProductImageResponse] })
    images: ProductImageResponse[];

    @ApiProperty({ example: 'Harmony Foundation Series...' }) product_name: string;
    @ApiProperty({ example: 'harmony-foundation-series' }) slug: string;
    @ApiProperty({ example: '2.888.000₫', nullable: true }) price_display: string | null;
    @ApiProperty({ example: 'Description text...' }) description: string;
    @ApiProperty({ example: '2888000.00' }) price_numeric: string;
    @ApiProperty({ example: 41 }) stock_quantity: number;

    @ApiProperty({
        example: { "Bag": "Yes", "Body Type": "Petite OM" },
        nullable: true
    })
    specifications: Record<string, any> | null;

    @ApiProperty({ example: '2025-11-23T03:36:16.082Z' }) created_at: Date;
    @ApiProperty({ example: '2025-11-23T03:36:16.082Z' }) updated_at: Date;
}

// ==========================================
// 3. PAGINATION WRAPPERS (Khai báo thẳng)
// ==========================================

/**
 * Response cho API lấy theo BRAND (brands/:slug)
 */
export class BrandListResponse {
    @ApiProperty({ type: () => [ProductListItemResponse] })
    data: ProductListItemResponse[];

    @ApiProperty({ example: 686 }) total: number;
    @ApiProperty({ example: 1 }) currentPage: number;
    @ApiProperty({ example: 64 }) limit: number;
    @ApiProperty({ example: 11 }) totalPages: number;

    // Example riêng cho Brand
    @ApiProperty({ example: 'Fender' }) entityName: string;
    @ApiProperty({ example: 'fender' }) entitySlug: string;
    @ApiProperty({ example: 'brand' }) entityType: string;
}

/**
 * Response cho API lấy theo CATEGORY (categories/:slug)
 */
export class CategoryListResponse {
    @ApiProperty({ type: () => [ProductListItemResponse] })
    data: ProductListItemResponse[];

    @ApiProperty({ example: 1000 }) total: number;
    @ApiProperty({ example: 1 }) currentPage: number;
    @ApiProperty({ example: 64 }) limit: number;
    @ApiProperty({ example: 16 }) totalPages: number;

    // Example riêng cho Category
    @ApiProperty({ example: 'Electric Guitars' }) entityName: string;
    @ApiProperty({ example: 'electric-guitars' }) entitySlug: string;
    @ApiProperty({ example: 'category' }) entityType: string;
}

// ==========================================
// 4. SEARCH WRAPPER
// ==========================================

export class SearchCollectionResponse {
    @ApiProperty({ example: 1 }) id: number;
    @ApiProperty({ example: 'Fender' }) name: string;
    @ApiProperty({ example: 'fender' }) slug: string;
    @ApiProperty({ example: 'brand', enum: ['brand', 'category'] }) type: 'brand' | 'category';
}

export class SearchResponse {
    @ApiProperty({ type: () => [SearchCollectionResponse] })
    collections: SearchCollectionResponse[];

    // Search trả về list item (không bắt buộc category)
    @ApiProperty({ type: () => [ProductListItemResponse] })
    products: ProductListItemResponse[];
}