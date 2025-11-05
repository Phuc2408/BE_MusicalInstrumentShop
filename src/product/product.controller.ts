import { Controller, Get, Post, Body, Patch, Param, Delete, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('v1/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query) {
      return {collections:[], products:[]}
    }
    return this.productService.unifiedSearch(query);
  }
  @Get('brands/:slug')
    async getProductsByBrandSlug(
      @Param('slug') slug: string, 
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(64), ParseIntPipe) limit: number,
  ) {
      return this.productService.filterAndPaginateBySlug(slug, 'brand', page, limit); 
  }

  @Get('categories/:slug')
  async getProductsByCategorySlug(
      @Param('slug') slug: string, 
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(64), ParseIntPipe) limit: number,
  ) {
      return this.productService.filterAndPaginateBySlug(slug, 'category', page, limit);
  }
  

  @Get(':slug')
  async getProductByProductSlug(@Param('slug') slug: string) {
    return this.productService.findProductDetailBySlug(slug)
  }
  
  // @Post()
  // create(@Body() createProductDto: CreateProductDto) {
  //   return this.productService.create(createProductDto);
  // }

  // @Get()
  // findAll() {
  //   return this.productService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.productService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
  //   return this.productService.update(+id, updateProductDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.productService.remove(+id);
  // }
}
