export interface IProduct {
    id: number;
    
    brand: IBrand; 
    category: ICategory; 
    images: IProductImage[]; 
 
    product_name: string;
    slug: string;
    price_display: string | null; 
    description: string | null; 
    price_numeric: number; 
    stock_quantity: number;
    specifications: object | null; 
}

export interface IBrand {
    id: number;

    name: string;
    slug: string;
    description: string | null; 
    
    created_at: Date;
    updated_at: Date;
    
    products: IProduct[]; 
}

export interface ICategory {
    id: number;

    name: string;
    slug: string;
    
    parent: ICategory | null; 
    children: ICategory[];
    
    products: IProduct[];
    
}

export interface IProductImage {
    id: number;

    image_url: string;
    is_main: boolean;
    
    created_at: Date;
    
    product: IProduct; 
}

export interface PaginationResult {
    data: IProduct[];
    total: number;
    currentPage: number;
    limit: number;
    totalPages: number;
    entityName: string;
    entitySlug: string;
    entityType: 'brand' | 'category';
}