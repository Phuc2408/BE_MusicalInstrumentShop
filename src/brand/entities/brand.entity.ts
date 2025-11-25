import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity('brands')
export class Brand{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string;
    
    @CreateDateColumn({ type: 'timestamp without time zone' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp without time zone' })
    updated_at: Date;
    
    @OneToMany(() => Product, product => product.brand)
    products: Product[];
}