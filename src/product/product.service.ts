import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BrandService } from 'src/brand/brand.service';
import { CategoryService } from 'src/category/category.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    private readonly brandService: BrandService,
    private readonly categoryService: CategoryService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async unifiedSearch(query: string): Promise<any>{
    const brands = await this.brandService.findByName(query);
    const categories = await this.categoryService.findByName(query);

    const brandIds = brands.map(brand => brand.id)
    const categoryIds = categories.map(category => category.id)
    
    const products = await this.searchProduct(query, brandIds, categoryIds)

    const collections = [
      ...brands.map(brand => ({ ...brand, type: 'brand' })),
      ...categories.map(category=>({...category, type:'category'}))
    ]
    
    return {collections, products}
  }

  private async searchProduct(query: string, brandIds: number[], categoryIds: number[]): Promise<any>{
    const searchName = `%${query}%`
    const qb = this.productRepository.createQueryBuilder('p')

    qb.where('p.product_name ILIKE :searchName', { searchName });

    if (brandIds.length > 0) {
      qb.orWhere('p.brand_id IN (:...brandIds)', { brandIds })
    }

    if (categoryIds.length > 0) {
      qb.orWhere('p.category_id IN (:...categoryIds)', {categoryIds})
    }

    return qb.limit(10).getMany();
  }

  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  findAll() {
    return `This action returns all product`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
