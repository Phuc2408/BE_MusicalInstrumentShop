import { ApiProperty } from '@nestjs/swagger';

// ==========================================
// 1. SUB-DTOs (Các thành phần con)
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
// 2. PRODUCT ITEM DTOs
// ==========================================

/**
 * DTO cho ITEM trong danh sách (Brand List, Category List).
 * ĐẶC BIỆT: KHÔNG khai báo field 'category' ở đây để Swagger không hiển thị.
 */
export class ProductListItemResponse {
    @ApiProperty({ example: 1109 }) id: number;

    @ApiProperty({ type: () => BrandResponse })
    brand: BrandResponse;


    @ApiProperty({ type: () => [ProductImageResponse] })
    images: ProductImageResponse[];

    @ApiProperty({ example: 'Congress CST150 LR HSS Electric Guitar' }) product_name: string;
    @ApiProperty({ example: 'congress-cst150-lr-hss' }) slug: string;
    @ApiProperty({ example: '3.750.000₫', nullable: true }) price_display: string | null;
    @ApiProperty({ example: 'Modern tone...' }) description: string;
    @ApiProperty({ example: '3750000.00' }) price_numeric: string;
    @ApiProperty({ example: 3 }) stock_quantity: number;
    @ApiProperty({ example: { "Bridge": "Tremolo" }, nullable: true }) specifications: Record<string, any> | null;
    @ApiProperty({ example: '2025-11-23T03:36:16.082Z' }) created_at: Date;
    @ApiProperty({ example: '2025-11-23T03:36:16.082Z' }) updated_at: Date;
}

/**
 * DTO cho CHI TIẾT sản phẩm.
 * Khai báo tường minh để kiểm soát thứ tự hiển thị trong Swagger.
 */
export class ProductDetailResponse {
    @ApiProperty({ example: 221 }) id: number;

    @ApiProperty({ type: () => BrandResponse })
    brand: BrandResponse;

    // ✅ Thêm category vào đây, vị trí ngay dưới Brand
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
    @ApiProperty({ example: { "Bag": "Yes" }, nullable: true }) specifications: Record<string, any> | null;
    @ApiProperty({ example: '2025-11-23T03:36:16.082Z' }) created_at: Date;
    @ApiProperty({ example: '2025-11-23T03:36:16.082Z' }) updated_at: Date;
}

// ==========================================
// 3. PAGINATION WRAPPERs
// ==========================================

// Class Cha: Chỉ khai báo type, KHÔNG dùng @ApiProperty để tránh xung đột example ở con
export class PaginationBase {
    total: number;
    currentPage: number;
    limit: number;
    totalPages: number;
    entityName: string;
    entitySlug: string;
    entityType: string;
}

// Wrapper chung (nếu cần dùng ở đâu đó khác)
export class ProductPaginationWithoutCategoryResponse extends PaginationBase {
    @ApiProperty({ type: () => [ProductListItemResponse] })
    data: ProductListItemResponse[];

    @ApiProperty({ example: 1000 }) declare total: number;
    @ApiProperty({ example: 1 }) declare currentPage: number;
    @ApiProperty({ example: 64 }) declare limit: number;
    @ApiProperty({ example: 16 }) declare totalPages: number;
    @ApiProperty({ example: 'Entity Name' }) declare entityName: string;
    @ApiProperty({ example: 'entity-slug' }) declare entitySlug: string;
    @ApiProperty({ example: 'type' }) declare entityType: string;
}

// --- Wrapper riêng cho BRAND LIST (Để hiện Example đúng: Fender) ---
export class BrandListResponse extends PaginationBase {
    @ApiProperty({ type: () => [ProductListItemResponse] })
    data: ProductListItemResponse[];

    // Ghi đè Example
    @ApiProperty({ example: 686 }) declare total: number;
    @ApiProperty({ example: 1 }) declare currentPage: number;
    @ApiProperty({ example: 64 }) declare limit: number;
    @ApiProperty({ example: 11 }) declare totalPages: number;

    @ApiProperty({ example: 'Fender' }) declare entityName: string;
    @ApiProperty({ example: 'fender' }) declare entitySlug: string;
    @ApiProperty({ example: 'brand' }) declare entityType: string;
}

// --- Wrapper riêng cho CATEGORY LIST (Để hiện Example đúng: Electric Guitars) ---
export class CategoryListResponse extends PaginationBase {
    @ApiProperty({ type: () => [ProductListItemResponse] })
    data: ProductListItemResponse[];

    // Ghi đè Example
    @ApiProperty({ example: 1000 }) declare total: number;
    @ApiProperty({ example: 1 }) declare currentPage: number;
    @ApiProperty({ example: 64 }) declare limit: number;
    @ApiProperty({ example: 16 }) declare totalPages: number;

    @ApiProperty({ example: 'Electric Guitars' }) declare entityName: string;
    @ApiProperty({ example: 'electric-guitars' }) declare entitySlug: string;
    @ApiProperty({ example: 'category' }) declare entityType: string;
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

    // Search có thể trả về item đầy đủ (có category)
    @ApiProperty({ type: () => [ProductDetailResponse] })
    products: ProductDetailResponse[];
}