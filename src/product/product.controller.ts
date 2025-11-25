import { Controller, Get, Param, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductService } from './product.service';
import {
  ApiBadRequest,
  ApiInternalServerError,
  ApiNotFound,
  ApiOkResponseData
} from 'src/common/decorators/swagger.decorator';
import { BrandListResponse, CategoryListResponse, ProductDetailResponse, SearchResponse } from './dto/product.response.dto';



@ApiTags('Products')
@Controller('v1/products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Get('search')
  @ApiOperation({ summary: 'Search products and collections' })
  @ApiOkResponseData(SearchResponse)
  @ApiBadRequest('Invalid query parameter')
  async search(@Query('q') query: string): Promise<SearchResponse> {
    const result = await this.productService.unifiedSearch(query);
    return result as unknown as SearchResponse;
  }

  @Get('brands/:slug')
  @ApiOperation({ summary: 'Get paginated products by Brand Slug' })

  @ApiOkResponseData(BrandListResponse)

  @ApiBadRequest('Invalid page or limit')
  @ApiNotFound('Brand not found')
  async getProductsByBrandSlug(
    @Param('slug') slug: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(64), ParseIntPipe) limit: number,
  ): Promise<BrandListResponse> {
    const result = await this.productService.filterAndPaginateBySlug(slug, 'brand', page, limit);
    return result as unknown as BrandListResponse;
  }

  // --- 3. GET LIST BY CATEGORY ---
  @Get('categories/:slug')
  @ApiOperation({ summary: 'Get paginated products by Category Slug' })

  @ApiOkResponseData(CategoryListResponse)

  @ApiBadRequest('Invalid page or limit')
  @ApiNotFound('Category not found')
  async getProductsByCategorySlug(
    @Param('slug') slug: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(64), ParseIntPipe) limit: number,
  ): Promise<CategoryListResponse> {
    const result = await this.productService.filterAndPaginateBySlug(slug, 'category', page, limit);
    return result as unknown as CategoryListResponse;
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product detail by Slug' })

  @ApiOkResponseData(ProductDetailResponse)

  @ApiNotFound('Product not found')
  @ApiInternalServerError()
  async getProductByProductSlug(@Param('slug') slug: string): Promise<ProductDetailResponse> {
    const product = await this.productService.findProductDetailBySlug(slug);
    return product as unknown as ProductDetailResponse;
  }
}