import { Controller, Get, Param, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ProductService } from './product.service';
import {
  ApiBadRequest,
  ApiInternalServerError,
  ApiNotFound,
  ApiOkResponseData
} from 'src/common/decorators/swagger.decorator';
import { BrandListResponse, CategoryListResponse, ProductDetailResponse, SearchResponse } from './dto/product.response.dto';
import { PaginationDto } from './dto/pagination.dto';
import { SearchDto } from './dto/searchInput.dto';



@ApiTags('Products')
@Controller('v1/products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Get('search')
  @ApiOperation({ summary: 'Search products and collections' })
  @ApiOkResponseData(SearchResponse)
  async search(@Query() searchDto: SearchDto): Promise<SearchResponse> {
    const result = await this.productService.unifiedSearch(searchDto.q || '');
    return result as unknown as SearchResponse;
  }

  @Get('brands/:slug')
  @ApiOperation({ summary: 'Get paginated products by Brand Slug' })
  @ApiParam({
    name: 'slug',
    required: true,
    description: 'Brand slug (e.g., fender, gibson)',
    example: 'fender'
  })
  @ApiOkResponseData(BrandListResponse)

  @ApiBadRequest('Invalid page or limit')
  @ApiNotFound('Brand not found')
  async getProductsByBrandSlug(
    @Param('slug') slug: string,
    @Query() pagination: PaginationDto
  ): Promise<BrandListResponse> {
    const { page, limit } = pagination;
    const result = await this.productService.filterAndPaginateBySlug(slug, 'brand', page, limit);
    return result as unknown as BrandListResponse;
  }

  // --- 3. GET LIST BY CATEGORY ---
  @Get('categories/:slug')
  @ApiOperation({ summary: 'Get paginated products by Category Slug' })
  @ApiParam({
    name: 'slug',
    required: true,
    description: 'Category slug (e.g., acoustic-guitars, electric-guitars)',
    example: 'electric-guitars'
  })
  @ApiOkResponseData(CategoryListResponse)

  @ApiBadRequest('Invalid page or limit')
  @ApiNotFound('Category not found')
  async getProductsByCategorySlug(
    @Param('slug') slug: string,
    @Query() pagination: PaginationDto
  ): Promise<CategoryListResponse> {
    const { page, limit } = pagination;
    const result = await this.productService.filterAndPaginateBySlug(slug, 'category', page, limit);
    return result as unknown as CategoryListResponse;
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product detail by Slug' })
  @ApiParam({
    name: 'slug',
    description: 'Product Slug',
    example: 'fender-player-ii-stratocaster-electric-guitar-rw-fb-oxblood',
    required: true
  })
  @ApiOkResponseData(ProductDetailResponse)

  @ApiNotFound('Product not found')
  @ApiInternalServerError()
  async getProductByProductSlug(@Param('slug') slug: string): Promise<ProductDetailResponse> {
    const product = await this.productService.findProductDetailBySlug(slug);
    return product as unknown as ProductDetailResponse;
  }

  @Get("best-selling/:slug")
  async topBestSellingByCategory(
    @Param("slug") categorySlug: string,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.productService.getTopBestSellingByCategorySlug(categorySlug, Math.min(limit, 50));
  }
}