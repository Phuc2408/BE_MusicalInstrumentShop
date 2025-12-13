import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BrandService } from 'src/brand/brand.service';
import { CategoryService } from 'src/category/category.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { IProduct, PaginationResult } from 'src/common/types/products/product.type';
import { Category } from 'src/category/entities/category.entity';
// import { SearchResultDTO } from './dto/search-result.dto';


@Injectable()
export class ProductService {
  constructor(
    private readonly brandService: BrandService,
    private readonly categoryService: CategoryService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) { }

  async unifiedSearch(query: string) {
    // 1. Nếu query rỗng, trả về rỗng luôn (Optional - nếu Controller chưa check)
    if (!query) {
      return { collections: [], products: [] };
    }

    // 2. Tối ưu: Chạy song song tìm Brand và Category (nhanh hơn await từng cái)
    const [brands, categories] = await Promise.all([
      this.brandService.findByName(query),
      this.categoryService.findByName(query),
    ]);

    const brandIds = brands.map(brand => brand.id);
    const categoryIds = categories.map(category => category.id);

    // 3. Tìm sản phẩm dựa trên từ khóa + brand/category tìm được
    const products = await this.getProductBySearch(query, brandIds, categoryIds);

    // 4. Map dữ liệu về đúng cấu trúc SearchCollectionResponse
    const mappedBrands = brands.map(brand => ({
      id: brand.id,
      name: brand.name, // Check lại entity brand của bạn là 'name' hay 'brand_name'
      slug: brand.slug,
      type: 'brand' as const // Ép kiểu để khớp với enum DTO
    }));

    const mappedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name, // Check lại entity category là 'name' hay 'category_name'
      slug: cat.slug,
      type: 'category' as const
    }));

    // 5. Trả về Object thuần (Interceptor sẽ bọc nó vào field data)
    return {
      collections: [...mappedBrands, ...mappedCategories],
      products: products
    };
  }

  private async getProductBySearch(query: string, brandIds: number[], categoryIds: number[]): Promise<any> {
    const searchName = `%${query}%`
    const qb = this.productRepository.createQueryBuilder('p')

    qb.where('p.product_name ILIKE :searchName', { searchName });

    if (brandIds.length > 0) {
      qb.orWhere('p.brand_id IN (:...brandIds)', { brandIds })
    }

    if (categoryIds.length > 0) {
      qb.orWhere('p.category_id IN (:...categoryIds)', { categoryIds })
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
    let categoryIds: number[] = [];
    let entityName: string = '';
    const finalLimit = limit > 0 ? limit : 64;

    if (type === 'brand') {
      const brand = await this.brandService.findBySlug(slug);
      brandId = brand.id;
      entityName = brand.name;
    } else {
      const category = await this.categoryService.findBySlug(slug);
      entityName = category.name;
      if (slug === 'accessories') {
        categoryIds.push(category.id);
        const subCategories = await this.categoryRepository.find({
          where: {
            // Nếu bạn define relation trong TypeORM là 'parent'
            parent: { id: category.id }
          },
          select: ['id']
        });
        const subIds = subCategories.map(sub => sub.id);
        categoryIds.push(...subIds);
      }
      else {
        categoryIds = [category.id];
      }
    }

    return this.queryProductsCore(brandId, categoryIds, entityName, slug, page, finalLimit);
  }

  private async queryProductsCore(
    brandId: number | null,
    categoryIds: number[],
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

    if (categoryIds && categoryIds.length > 0) {
      qb.where('product.category_id IN (:...categoryIds)', { categoryIds });
    } else if (brandId) {
      qb.where('product.brand_id = :brandId', { brandId });
    }

    qb.orderBy('product.created_at', 'DESC');

    const [products, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);
    const type = (categoryIds && categoryIds.length > 0) ? 'category' : 'brand';

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
      throw new NotFoundException(`Product not found`);
    }
    return productDetail;
  }

  async getTopBestSellingByCategorySlug(categorySlug: string, limit = 10) {
    const okStatuses = ["CONFIRMED"]; // đúng case theo DB bạn

    const qb = this.productRepository
      .createQueryBuilder("p")
      .innerJoin(
        "categories",
        "c",
        "c.id = p.category_id AND c.slug = :categorySlug",
        { categorySlug },
      )
      .innerJoin("order_items", "oi", "oi.product_id = p.id")
      .innerJoin(
        "orders",
        "o",
        "o.id = oi.order_id AND o.status IN (:...okStatuses)",
        { okStatuses },
      )
      .leftJoin("product_images", "pi", "pi.product_id = p.id AND pi.is_main = true")
      .select([
        "p.id AS id",
        "p.slug AS slug",
        "p.product_name AS product_name",
        "p.price_numeric AS price_numeric",
        "p.price_display AS price_display",
        "pi.image_url AS image_url",
      ])
      .addSelect("SUM(oi.quantity)", "sold")
      .groupBy("p.id")
      .addGroupBy("p.slug")
      .addGroupBy("p.product_name")
      .addGroupBy("p.price_numeric")
      .addGroupBy("p.price_display")
      .addGroupBy("pi.image_url")
      .orderBy("sold", "DESC")
      .limit(limit);

    const rows = await qb.getRawMany<{
      id: string;
      slug: string;
      product_name: string;
      price_numeric: string;
      price_display: string;
      image_url: string | null;
      sold: string;
    }>();

    return rows.map((r) => ({
      id: Number(r.id),
      slug: r.slug,
      productName: r.product_name,
      priceNumeric: Number(r.price_numeric),
      priceDisplay: r.price_display,
      imageUrl: r.image_url,
      sold: Number(r.sold ?? 0),
    }));
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
