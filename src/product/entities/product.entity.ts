import { Entity, PrimaryGeneratedColumn, Column,  CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { Brand } from '../../brand/entities/brand.entity'
import { Category } from 'src/category/entities/category.entity';
import { ProductImage } from './product-image.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;
    
    @ManyToOne(() => Brand, brand => brand.products, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'brand_id' })
    brand: Brand;
    
    @ManyToOne(() => Category, category => category.products, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'category_id' })
    category: Category;
    
    @OneToMany(() => ProductImage, image => image.product, { cascade: true })
    images: ProductImage[];
  
    @Column({ type: 'varchar', length: 255 })
    product_name: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    slug: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    price_display: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'numeric', precision: 15, scale: 2 })
    price_numeric: number;

    @Column({ type: 'integer', default: 0 })
    stock_quantity: number;

    @Column({ type: 'jsonb', nullable: true })
    specifications: object;

    @CreateDateColumn({ type: 'timestamp without time zone' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp without time zone' })
    updated_at: Date;
 
}
