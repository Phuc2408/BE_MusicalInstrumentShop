import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BrandService } from 'src/brand/brand.service';
import { CategoryService } from 'src/category/category.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { IProduct, PaginationResult } from 'src/common/types/products/product.type';


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
    
    const products = await this.getProductBySearch(query, brandIds, categoryIds)

    const collections = [
      ...brands.map(brand => ({ ...brand, type: 'brand' })),
      ...categories.map(category=>({...category, type:'category'}))
    ]
    
    return {collections, products}
  }

  private async getProductBySearch(query: string, brandIds: number[], categoryIds: number[]): Promise<any>{
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

  async filterAndPaginateBySlug(
        slug: string, 
        type: 'brand' | 'category', 
        page: number, 
        limit: number
    ): Promise<PaginationResult> {
        
        let brandId: number | null = null;
        let categoryId: number | null = null;
        let entityName: string = '';
        const finalLimit = limit > 0 ? limit : 64;

        if (type === 'brand') {
            const brand = await this.brandService.findBySlug(slug); 
            brandId = brand.id;
            entityName = brand.name;
        } else { 
            const category = await this.categoryService.findBySlug(slug);
            categoryId = category.id;
            entityName = category.name;
        }
        
        return this.queryProductsCore(brandId, categoryId, entityName, slug, page, finalLimit);
    }

  private async queryProductsCore(
        brandId: number | null, 
        categoryId: number | null, 
        entityName: string, 
        entitySlug: string, 
        page: number, 
        limit: number
    ): Promise<PaginationResult> {
        
        const skip = (page - 1) * limit;

        const qb = this.productRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.brand', 'brand') 
            .leftJoinAndSelect('product.images', 'image')
            .skip(skip)
            .take(limit);

        if (categoryId) {
            qb.where('product.category_id = :categoryId', { categoryId });
        } else if (brandId) {
            qb.where('product.brand_id = :brandId', { brandId });
        }
        
        const [products, total] = await qb.getManyAndCount();
        const totalPages = Math.ceil(total / limit);
        const type = categoryId ? 'category' : 'brand'; 

        return {
            data: products,
            total: total, 
            currentPage: page,
            limit: limit,
            totalPages: totalPages,
            entityName: entityName,
            entitySlug: entitySlug,
            entityType: type,
        };
    }
  async findProductDetailBySlug(slug: string): Promise<IProduct> {
    const productDetail = await this.productRepository.findOne({
      where: {
                slug: slug,
            },
            relations: [
                'brand',    
                'category', 
                'images',   
            ],
           
            order: {
                images: {
                    is_main: 'DESC', 
                    created_at: 'ASC', 
                }
            }
    })
    
    if (!productDetail) {
      throw new NotFoundException(`Product with slug "${slug}" not found.`);
    }
    return productDetail;
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
