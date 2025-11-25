import { Entity, PrimaryGeneratedColumn, Column,  CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity('categories')
export class Category{
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    slug: string;
    
    @Column({ type: 'int', name: 'parent_id', nullable: true })
    parent_id: number | null;

    @ManyToOne(() => Category, category => category.children, { nullable: true })
    @JoinColumn({ name: 'parent_id' })
    parent: Category;

    @OneToMany(() => Category, category => category.parent)
    children: Category[];
    
    @OneToMany(() => Product, product => product.category)
    products: Product[];

    @CreateDateColumn({ type: 'timestamp without time zone' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp without time zone' })
    updated_at: Date;
}